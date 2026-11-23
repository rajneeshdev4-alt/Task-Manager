function sendSuccess(res, statusCode, message, data, pagination) {
  const body = {
    success: true,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  if (pagination) {
    body.pagination = pagination;
  }

  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess };
