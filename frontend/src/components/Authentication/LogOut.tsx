import React, { useEffect } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { markUserOffline, getUserIDFromToken } from './apiCalls.tsx';

const LogOut = () => {
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		
		const changeUserStatus = async (userID: number) => {
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
		}
		
		try {
			const userID = location.state?.userID;
			changeUserStatus(userID);
			localStorage.removeItem('authenticationToken');
			navigate('/');
		} catch (error) {
			console.error('Error while logging out');
			navigate('/');
		}
	
	}, [navigate]);

	return <SingleHeader text="Logging out..." />;
};

export default LogOut;