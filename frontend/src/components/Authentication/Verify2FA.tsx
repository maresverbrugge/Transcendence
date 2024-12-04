import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useLocation, useNavigate } from 'react-router-dom';

const Verify2FA = () => {
	const navigate = useNavigate();
  const location = useLocation();
	const [oneTimePassword, setOneTimePassword] = useState('');
	const [passwordVerified, setPasswordVerified] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

	const verifyOneTimePassword = () => {
		setIsLoading(true);

		const userID = location.state?.userID;
    if (!userID) {
      console.error('Error getting userID from location');
      setErrorOccurred(true);
      return;
    }

		axios.post('http://localhost:3001/two-factor/verify', {
			oneTimePassword: oneTimePassword,
			userID: userID,
		})
		.then(response => {
			console.log('Verified:', response.data); // For debugging
			setPasswordVerified(response.data);
			if (passwordVerified) {
				const token = localStorage.getItem('tempToken');
				if (token) {
					localStorage.setItem('authenticationToken', token);
					localStorage.removeItem('tempToken');
					axios.post('http://localhost:3001/login/online', { token: token })
					navigate('/main');
				} else {
					console.error('Temp token not found');
					setErrorOccurred(true);
				}
			}
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
	else if (isLoading && !errorOccurred) {
		return <SingleHeader text="Loading..." />;
	} else if (passwordVerified) {
		return <Navigate to="/main" />;
	} else if (errorOccurred) {
		return <SingleHeader text="Error occurred while verifying one time password" />;
	} 
}

export default Verify2FA;