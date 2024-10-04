import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Switch, TextField } from '@mui/material';
import axios from 'axios';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [apiKeyEnabled, setApiKeyEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/settings');
        setApiKey(response.data.apiKey);
        setApiKeyEnabled(response.data.apiKeyEnabled);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/settings/toggle-api');
      setApiKeyEnabled(response.data.apiKeyEnabled);
    } catch (error) {
      console.error('Error toggling API access:', error);
    }
  };

  const regenerateApiKey = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/settings/regenerate-api-key');
      setApiKey(response.data.apiKey);
    } catch (error) {
      console.error('Error regenerating API key:', error);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Typography variant="h6">API Key</Typography>
      <TextField
        value={apiKey}
        fullWidth
        margin="normal"
        InputProps={{ readOnly: true }}
        variant="outlined"
      />

      <Typography variant="h6">API Access</Typography>
      <Switch
        checked={apiKeyEnabled}
        onChange={handleToggle}
        inputProps={{ 'aria-label': 'API Access Toggle' }}
      />
      <Typography>{apiKeyEnabled ? 'Enabled' : 'Disabled'}</Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={regenerateApiKey}
        sx={{ mt: 2 }}
      >
        Regenerate API Key
      </Button>
    </Box>
  );
}

export default Settings;