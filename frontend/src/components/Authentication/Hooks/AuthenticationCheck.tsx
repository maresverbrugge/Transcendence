import { useEffect, useState } from 'react';
import axios from 'axios';

const isAuthenticatedHook = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authenticationToken');
    if (!token) {
      setIsAuthenticated(false);
    } else {
      axios.post('http://localhost:3001/login/verify-token', { 
        token: token, 
      })
      .then((response) => {
        const authenticated = response.data;
        if (!authenticated) {
          localStorage.removeItem('authenticationToken');
        }
        setIsAuthenticated(authenticated);
      })
      .catch((err) => {
        console.error('Error verifying token:', err);
        setIsAuthenticated(false);
      });
    }
  }, []);

  return isAuthenticated;
};

export default isAuthenticatedHook;
