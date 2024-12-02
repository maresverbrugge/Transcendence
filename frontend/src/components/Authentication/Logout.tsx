import React, { useEffect } from 'react';
import SingleHeader from './Pages/SingleHeader.tsx';

const Logout = () => {
	useEffect(() => {
		localStorage.removeItem('authenticationToken');
		window.location.href = '/';
	}, []);

	return <SingleHeader text="Logging out..." />;
};

export default Logout;