import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import SingleHeader from './Pages/SingleHeader';

const SetUp2FA = () => {
	const [oneTimePassword, setOneTimePassword] = useState('');
	const [passwordVerified, setPasswordVerified] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

	const verifyOneTimePassword = () => {
		setIsLoading(true);
		axios.post('http://localhost:3001/two-factor/verify', {
			oneTimePassword: oneTimePassword
		})
		.then(response => {
			console.log('Verified:', response.data); // For debugging
			setPasswordVerified(response.data);
		})
		.catch(err => {
			console.error('Error while verifying one time password:', err);
			setErrorOccurred(true);
		});
		setIsLoading(false);
	}

	if (!passwordVerified && !isLoading && !errorOccurred) {
		return (
			<div>
				<p>Enter your one time password:</p>
				<input 
					type="text"
					value={oneTimePassword}
					onChange={(e) => setOneTimePassword(e.target.value)}
				/>
				<button onClick={verifyOneTimePassword}>Submit</button>
			</div>
		);
	}
	else if (isLoading) {
		return <SingleHeader text="Loading..." />;
	} else if (passwordVerified) {
		return <Navigate to="/main" />;
	} else if (errorOccurred) {
		return <SingleHeader text="Error occurred while verifying one time password" />;
	} 
}

export default SetUp2FA;