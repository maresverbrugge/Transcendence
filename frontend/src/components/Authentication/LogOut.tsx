import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SingleHeader from './Pages/SingleHeader';
import { markUserOffline } from '../Utils/apiCalls';

const LogOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logOutUser = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        if (!token) throw new Error('Authentication token not found');
        await markUserOffline(token);
      } catch (error) {
        console.error('Error while logging out');
      } finally {
        localStorage.removeItem('authenticationToken');
        navigate('/');
      }
    };
    logOutUser();
  }, [navigate]);

  return <SingleHeader text="Logging out..." />;
};

export default LogOut;
