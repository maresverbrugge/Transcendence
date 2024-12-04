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
	const [errorMessage, setErrorMessage] = useState('');

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
			else {
				setErrorMessage('Invalid one-time password. Please try again.');
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
			<div className="card shadow d-flex justify-content-center align-items-center p-3 m-3">
				<p>Enter your one time password:</p>
				<input 
					type="text"
					value={oneTimePassword}
					onChange={(e) => setOneTimePassword(e.target.value)}
				/>
				<button 
					style={{ width: '100px', margin: '20px' }}
					onClick={verifyOneTimePassword}>
					Submit
				</button>
				{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
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