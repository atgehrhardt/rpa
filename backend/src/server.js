const { app, server } = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const taskManager = require('./utils/taskManager');

dotenv.config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectDB();
    await taskManager.loadTasks();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();