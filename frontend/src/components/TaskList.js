import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, Typography, CircularProgress, Box, Modal, TextField } from '@mui/material';
import { useTasks } from '../context/TaskContext';
import axios from 'axios';
import PromptModal from './PromptModal';

function TaskList() {
  const { runningTasks, setRunningTasks, addRunningTask } = useTasks();
  const [tasks, setTasks] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptFields, setPromptFields] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [apiKey, setApiKey] = useState('');  // Added apiKey state to dynamically set the key

  /** Fetch API Key from backend */
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/settings');
        setApiKey(response.data.apiKey);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
  }, []);

  /** Fetch tasks */
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/tasks', {
          headers: { 'x-api-key': apiKey }
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    // Only fetch tasks when apiKey is set (meaning it's fetched)
    if (apiKey) {
      fetchTasks();
    }
  }, [apiKey]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleTaskClick = (task) => {
    console.log('Task clicked and its promptConfig:', task.promptConfig);
    if (task.promptConfig) {
      setPromptFields(task.promptConfig);
      setSelectedTask(task);
      setShowPromptModal(true);
    } else if (task.uploadConfig && task.uploadConfig.required) {
      setSelectedTask(task);
      setShowUploadModal(true);
    } else {
      executeTask(task.id);
    }
  };

  const handleUploadAndExecute = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const uploadResponse = await axios.post('http://localhost:3001/api/tasks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': apiKey,
        },
      });

      await executeTask(selectedTask.id, uploadResponse.data.fileName);
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error uploading file and executing task:', error);
    }
  };

  const handlePromptSubmit = async (formData) => {
    console.log('Prompt data submitted:', formData);
    await executeTask(selectedTask.id, null, formData);
    setShowPromptModal(false);
    setSelectedTask(null);
  };

  const executeTask = async (taskId, uploadedFileName = null, promptData = null) => {
    try {
      console.log('Executing task:', taskId, 'with prompt data:', promptData);
      addRunningTask({
        id: taskId,
        status: 'running',
      });

      const response = await axios.post(
        `http://localhost:3001/api/tasks/run/${taskId}`,
        { fileName: uploadedFileName, promptData },
        {
          responseType: 'blob',
          headers: {
            'x-api-key': apiKey,  // Attach dynamically fetched API key here
          },
        }
      );

      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'download';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '').trim();
        }
      }

      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setRunningTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error executing task:', error);
      setRunningTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, status: 'failed' } : task))
      );
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Running Tasks
      </Typography>
      <Box sx={{ height: 300, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
        <List sx={{ minHeight: 300 }}>
          {runningTasks.map((task, index) => (
            <ListItem key={`${task.id}-${task.status}-${index}`}>
              <ListItemText
                primary={`Task ${task.id}`}
                secondary={`Status: ${task.status}`}
              />
              {task.status === 'running' && <CircularProgress size={24} sx={{ mr: 2 }} />}
            </ListItem>
          ))}
        </List>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Available Tasks
      </Typography>
      <List>
        {tasks.map((task, index) => (
          <ListItem key={`${task.id}-${index}`}>
            <ListItemText primary={task.name} secondary={task.description} />
            <Button
              onClick={() => handleTaskClick(task)}
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
            >
              Execute
            </Button>
          </ListItem>
        ))}
      </List>

      <PromptModal
        open={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        fields={promptFields}
        onSubmit={handlePromptSubmit}
      />

      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        aria-labelledby="upload-modal-title"
        aria-describedby="upload-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="upload-modal-title" variant="h6" component="h2">
            Upload File for {selectedTask?.name}
          </Typography>
          <Typography id="upload-modal-description" sx={{ mt: 2 }}>
            Please upload the required file to proceed with the task.
          </Typography>
          <TextField
            type="file"
            onChange={handleFileChange}
            inputProps={{
              accept: selectedTask?.uploadConfig?.accept || '*',
            }}
            sx={{ mt: 2 }}
          />
          <Button
            onClick={handleUploadAndExecute}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={!selectedFile}
          >
            Upload and Execute
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default TaskList;