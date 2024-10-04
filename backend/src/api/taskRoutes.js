const express = require('express');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const taskManager = require('../utils/taskManager');
const apiKeyAuth = require('../middleware/apiKeyAuth'); // Import API key middleware

const upload = multer({ dest: path.join(__dirname, '..', '..', 'tasks', 'uploads') });

router.get('/', (req, res) => {
  const tasks = taskManager.getAllTasks();
  res.json(tasks);
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ fileName: req.file.filename });
});

// Secured task execution route
router.post('/run/:taskId', apiKeyAuth, async (req, res) => {
  const { taskId } = req.params;
  const { fileName, promptData } = req.body;

  console.log('Received task execution request:', { taskId, fileName, promptData });

  try {
    const resultFileName = await taskManager.runTask(taskId, fileName, promptData);

    if (resultFileName) {
      const filePath = path.join(taskManager.downloadsDirectory, resultFileName);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(`File not found: ${resultFileName}`);
          return res.status(404).send('File not found');
        }

        res.setHeader('Content-Disposition', `attachment; filename="${resultFileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        fileStream.on('open', () => fileStream.pipe(res));
        fileStream.on('close', async () => {
          try {
            await fs.promises.unlink(filePath);
            console.log(`Deleted result file: ${resultFileName}`);
          } catch (error) {
            console.error(`Error deleting file after sending: ${error.message}`);
          }
        });

        fileStream.on('error', (err) => {
          console.error(`Stream error: ${err}`);
          res.status(500).send('Server Error');
        });
      });
    } else {
      res.json({ message: 'Task completed without generating a downloadable file' });
    }
  } catch (error) {
    console.error('Error running task:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;