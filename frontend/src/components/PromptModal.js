import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

function PromptModal({ open, onClose, fields, onSubmit }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Initialize formData with field names as keys and empty strings as values
    const initialFormData = {};
    fields.forEach(field => {
      initialFormData[field.name] = '';
    });
    setFormData(initialFormData);
  }, [fields]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFormSubmit = () => {
    console.log('Submitting form data:', formData);  // Debugging point to see submitted data
    onSubmit(formData);  // Trigger the parent submit handler with the form data
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="prompt-modal-title">
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="prompt-modal-title" variant="h6" component="h2">
          Task Input Required
        </Typography>
        {fields.map((field, index) => (
          <TextField
            key={index}
            label={field.label}
            type={field.type === 'password' ? 'password' : 'text'}
            name={field.name}
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData[field.name] || ''}
            multiline={field.type === 'longAnswer'}
          />
        ))}
        <Button
          onClick={handleFormSubmit}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
}

export default PromptModal;