import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Button } from '@mui/material';
import TaskList from './components/TaskList';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Settings from './components/Settings'; // Import Settings page
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Dark mode theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  return !isAuthenticated ? <Navigate to="/login" /> : user?.isAdmin ? children : <Navigate to="/" />;
}

function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>My Application</Typography>
        {isAuthenticated ? (
          <>
            {user?.isAdmin && (
              <>
                <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit', marginRight: '10px' }}>
                  <Button color="inherit">Admin Panel</Button>
                </Link>
                <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit', marginRight: '10px' }}>
                  <Button color="inherit">Settings</Button>
                </Link>
              </>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'inherit', marginRight: '10px' }}>
              <Button color="inherit">Login</Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Button color="inherit">Register</Button>
            </Link>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <TaskProvider>
          <Router>
            <Header />
            <div style={{ padding: '20px' }}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> {/* Add settings route */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;