import React, { useEffect } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { markUserOffline, getUserIDFromToken } from '../Utils/apiCalls.tsx';

const LogOut = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const userID = location.state?.userID;

	useEffect(() => {
		const logOutUser = async (userID: number) => {
			try {
				if (!userID) {
					const token = localStorage.getItem('authenticationToken');
					if (!token) {
						navigate('/');
						return;
					}
					const response = await getUserIDFromToken(token);
					userID = response.data;
				}
				await markUserOffline(userID);
			} catch (error) {
				console.error('Error while logging out');
			} finally {
				navigate('/');
				localStorage.removeItem('authenticationToken');
			}
		}
		logOutUser(userID);
	}, [navigate]);

	return <SingleHeader text="Logging out..." />;
};

export default LogOut;