import { useEffect, useState } from 'react';
import { verifyToken } from '../../Utils/apiCalls';

const isAuthenticatedHook = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authenticationToken');
    if (!token) {
      setIsAuthenticated(false);
    } else {
      const verify = async () => {
        try {
          const response = await verifyToken(token);
          const authenticated = response.data;
          if (!authenticated) {
            localStorage.removeItem('authenticationToken');
          }
          setIsAuthenticated(authenticated);
        } catch (err) {
          console.error('Error verifying token:', err);
          setIsAuthenticated(false);
        }
      };
      verify();
    }
  }, []);

  return isAuthenticated;
};

export default isAuthenticatedHook;
