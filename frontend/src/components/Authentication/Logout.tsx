import React, { useEffect } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
	const navigate = useNavigate();

	useEffect(() => {
		localStorage.removeItem('authenticationToken');
		navigate('/');
	}, []);

	return <SingleHeader text="Logging out..." />;
};

export default Logout;