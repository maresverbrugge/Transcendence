import React, { useEffect } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate } from 'react-router-dom';
import { markUserOffline } from '../Utils/apiCalls.tsx';

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
		}
		logOutUser();
	}, [navigate]);

	return <SingleHeader text="Logging out..." />;
};

export default LogOut;