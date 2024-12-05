import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, markUserOnline } from '../Utils/apiCalls.tsx';


const Verify2FA = () => {
	const navigate = useNavigate();
	const [oneTimePassword, setOneTimePassword] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	const verifyOneTimePassword = async () => {
		setIsLoading(true);
		try {
			const token = localStorage.getItem('tempToken');
      if (!token) throw new Error('Authentication token not found');
			const response = await verifyOTP(token, oneTimePassword);
			const verified = response.data;
			if (verified) {
        localStorage.setItem('authenticationToken', token);
        localStorage.removeItem('tempToken');
        await markUserOnline(token);
        navigate('/main');
			} else {
				setErrorMessage('Invalid one-time password. Please try again.');
			}
		} catch (error) {
			console.error('Error verifying one-time password:', error);
			setErrorMessage('Error verifying one-time password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
    <div className="card shadow d-flex justify-content-center align-items-center p-3 m-3">
      <p>Enter your one-time password:</p>
      <input
        type="text"
        value={oneTimePassword}
        onChange={(e) => setOneTimePassword(e.target.value)}
      />
      <button style={{ width: '150px', margin: '20px' }} onClick={verifyOneTimePassword} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
      {errorMessage && <p style={{ color: 'red' }} aria-live="polite">{errorMessage}</p>}
    </div>
  );
}

export default Verify2FA;