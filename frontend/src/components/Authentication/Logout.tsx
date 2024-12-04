import React, { useEffect } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { markUserOffline } from './apiCalls.tsx';

interface LocationState {
  userID: string;
}

const Logout = () => {
	const navigate = useNavigate();
	const location = useLocation<LocationState>();

	useEffect(() => {
		
		const changeUserStatus = async (userID: number) => {
			await markUserOffline(userID);
		}
		
		try {
			const userID = location.state?.userID;
			if (!userID) {
				throw new Error('User ID required for logging out');
			}
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

export default Logout;