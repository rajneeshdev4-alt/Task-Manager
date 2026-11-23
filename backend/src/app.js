const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const taskRoutes = require('./modules/task/task.routes');
const { notFoundMiddleware } = require('./middleware/notFound.middleware');
const { errorMiddleware } = require('./middleware/error.middleware');

function createApp() {
  const app = express();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: frontendUrl,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    })
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many requests. Please try again later.',
        },
      })
    );
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Task Manager API is running' });
  });

  app.use('/api/v1/tasks', taskRoutes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };
