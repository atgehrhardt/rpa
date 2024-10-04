const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// const { createPrompt } = require('./promptUtils'); // Assuming this is unused in your code

class TaskManager {
  constructor() {
    this.tasksDirectory = path.join(__dirname, '..', '..', 'tasks');
    this.uploadsDirectory = path.join(this.tasksDirectory, 'uploads');
    this.downloadsDirectory = path.join(this.tasksDirectory, 'downloads');
    this.tasks = {};
    this.runningTasks = new Map();
    this.taskLogs = new Map();
  }

  async loadTasks() {
    try {
      await fs.access(this.tasksDirectory);
    } catch (error) {
      console.log('Tasks directory does not exist. Creating it...');
      await fs.mkdir(this.tasksDirectory, { recursive: true });
    }

    await fs.mkdir(this.uploadsDirectory, { recursive: true });
    await fs.mkdir(this.downloadsDirectory, { recursive: true });

    try {
      const files = await fs.readdir(this.tasksDirectory);
      console.log('Files in tasks directory:', files);

      for (const file of files) {
        if (file.endsWith('.js')) {
          const taskName = path.basename(file, '.js');
          const taskPath = path.join(this.tasksDirectory, file);
          console.log(`Attempting to load task: ${taskName} from ${taskPath}`);

          try {
            const task = require(taskPath);
            if (typeof task.run === 'function') {
              this.tasks[taskName] = task;
              console.log(`Successfully loaded task: ${taskName}`);
            } else {
              console.error(`Task ${taskName} does not have a run method`);
            }
          } catch (error) {
            console.error(`Error loading task ${taskName}:`, error);
          }
        }
      }

      console.log(`Loaded ${Object.keys(this.tasks).length} tasks`);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  getAllTasks() {
    return Object.keys(this.tasks).map(taskName => ({
      id: taskName,
      name: this.tasks[taskName].name || taskName,
      description: this.tasks[taskName].description || '',
      promptConfig: this.tasks[taskName].promptConfig || null,    // *** Include promptConfig ***
      uploadConfig: this.tasks[taskName].uploadConfig || null,
    }));
  }

  async runTask(taskId, uploadedFileName = null, promptData = null) {
    if (!this.tasks[taskId]) {
      throw new Error('Task not found');
    }
  
    const runId = uuidv4();
    this.runningTasks.set(runId, { id: taskId, status: 'running' });
    this.taskLogs.set(runId, []);
  
    const logFunction = (message) => {
      const logs = this.taskLogs.get(runId);
      logs.push(message);
      this.taskLogs.set(runId, logs);
      console.log(`[Task ${taskId}]: ${message}`);
    };
  
    let uploadedFilePath = null;
    let resultFileName = null;
  
    try {
      logFunction(`Starting task: ${taskId}`);
  
      // **Validation**: If task has a promptConfig, ensure necessary promptData is provided
      const task = this.tasks[taskId];
      if (task.promptConfig && task.promptConfig.length > 0) {
        if (!promptData || Object.keys(promptData).length === 0) {
          logFunction(`Task ${taskId} requires prompt data, but none was provided.`);
          throw new Error(`Task ${taskId} requires prompt data (e.g., search term, etc.).`);
        }
        // Check that promptData includes all necessary fields defined in the promptConfig
        task.promptConfig.forEach((config) => {
          if (!promptData[config.name]) {
            throw new Error(`Missing required prompt data for: ${config.name}`);
          }
        });
      }
  
      if (uploadedFileName) {
        uploadedFilePath = path.join(this.uploadsDirectory, uploadedFileName);
        await fs.access(uploadedFilePath);
      }
  
      // Task execution
      resultFileName = await task.run(logFunction, uploadedFilePath, promptData);
      logFunction(`Task ${taskId} completed. Result: ${resultFileName}`);
      this.runningTasks.set(runId, { id: taskId, status: 'completed' });
      return resultFileName;
    } catch (error) {
      logFunction(`Error running task ${taskId}: ${error.message}`);
      this.runningTasks.set(runId, { id: taskId, status: 'failed' });
      throw error;
    } finally {
      if (uploadedFilePath) {
        try {
          await fs.unlink(uploadedFilePath);
          logFunction(`Deleted uploaded file: ${uploadedFileName}`);
        } catch (error) {
          logFunction(`Error deleting uploaded file ${uploadedFileName}: ${error.message}`);
        }
      }
    }
  }

  getTaskLogs(runId) {
    return this.taskLogs.get(runId) || [];
  }

  getAllRunningTasks() {
    return Array.from(this.runningTasks.values()).filter(task => task.status === 'running');
  }

  async getDownloadFilePath(fileName) {
    const filePath = path.join(this.downloadsDirectory, fileName);
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      throw new Error('Download file not found');
    }
  }

  async cleanupDownloads() {
    try {
      const files = await fs.readdir(this.downloadsDirectory);
      for (const file of files) {
        const filePath = path.join(this.downloadsDirectory, file);
        await fs.unlink(filePath);
        console.log(`Deleted old download: ${file}`);
      }
    } catch (error) {
      console.error('Error cleaning up downloads:', error);
    }
  }
}

const taskManager = new TaskManager();
taskManager.loadTasks();

module.exports = taskManager;