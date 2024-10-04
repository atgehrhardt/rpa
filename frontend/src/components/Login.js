import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // For redirect after login
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();  // Access AuthContext login function
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || 'Invalid login credentials');
        return;
      }

      setError(null);  // Clear any previous errors
      login(data.token);  // Login user with token
      navigate('/');  // Redirect to home after login
    } catch (error) {
      console.error('Login Error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',  // Vertically center
        padding: 2,  // Responsive padding
      }}
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      
      {/* Error Display */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Username Input */}
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />

      {/* Password Input */}
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />

      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        fullWidth
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </Box>
  );
}

export default Login;