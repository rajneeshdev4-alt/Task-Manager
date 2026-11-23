require('dotenv').config();

const { createApp } = require('./app');
const { connectDatabase } = require('./config/database');

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDatabase(process.env.MONGODB_URI);
    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Task Manager API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { start };
