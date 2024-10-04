import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../context/AuthContext';  // Access token from auth context

function AdminPanel() {
  const { isAuthenticated, user } = useAuth();  // Access user and token from context
  const [unapprovedUsers, setUnapprovedUsers] = useState([]);

  useEffect(() => {
    // Fetch unapproved users from the server
    const fetchUnapprovedUsers = async () => {
      try {
        const token = localStorage.getItem('authToken'); // Get token from local storage
        const response = await fetch('http://localhost:3001/api/users/unapproved', {
          method: 'GET',
          headers: {
            'x-auth-token': token,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUnapprovedUsers(data);
        } else {
          console.error('Failed to fetch unapproved users:', data.msg);
        }
      } catch (error) {
        console.error('Error fetching unapproved users:', error);
      }
    };

    fetchUnapprovedUsers();
  }, []);

  const handleApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('authToken'); // Get token from local storage
      const response = await fetch(`http://localhost:3001/api/users/approve/${userId}`, {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
      });
      if (response.ok) {
        setUnapprovedUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));  // Remove approved user from list
        alert('User approved');
      } else {
        const data = await response.json();
        console.error('Failed to approve user:', data.msg);
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Admin Panel: Approve Users
      </Typography>

      {unapprovedUsers.length === 0 ? (
        <Typography>No users awaiting approval.</Typography>
      ) : (
        <List>
          {unapprovedUsers.map((user) => (
            <ListItem key={user._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <ListItemText primary={user.username} secondary={user.email} />
              <Button variant="contained" color="primary" onClick={() => handleApproveUser(user._id)}>
                Approve
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default AdminPanel;