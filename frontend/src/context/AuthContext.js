import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const fetchUserDetails = async (token) => {
    console.log("Attempting to fetch user details with token:", token);
    try {
      const response = await fetch('http://localhost:3001/api/users/me', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      console.log("Response from /me endpoint:", data);
      if (response.ok) {
        setUser(data);
        setIsAuthenticated(true);
        console.log("User authenticated and details set:", data);
      } else {
        console.error('Failed to fetch user details:', data.msg);
        logout();
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log("Token retrieved from localStorage on refresh:", token);
    if (token) {
      fetchUserDetails(token);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem('authToken', token);
    console.log("Token stored in localStorage:", token);
    fetchUserDetails(token);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
    console.log("User logged out and token cleared");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}