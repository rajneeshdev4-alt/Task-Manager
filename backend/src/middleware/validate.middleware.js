const { ApiError } = require('../utils/ApiError');

function validate(schema, source = 'body') {
  return function validateRequest(req, res, next) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', errors));
    }

    req.validated = req.validated || {};
    req.validated[source] = result.data;
    return next();
  };
}

module.exports = { validate };
