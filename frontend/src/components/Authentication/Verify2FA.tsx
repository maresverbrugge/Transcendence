import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { verifyOTP, markUserOnline } from '../Utils/apiCalls';

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
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow d-flex justify-content-center align-items-center p-3 m-3">
        <p>Enter your one-time password:</p>
        <input
          className="form-control w-50 fs-5 fw-bold mt-2"
          type="text"
          value={oneTimePassword}
          placeholder="Enter OTP"
          onChange={(e) => setOneTimePassword(e.target.value)}/>
        <button
          className="btn btn-primary w-30 fs-5 fw-bold mt-3"
          onClick={verifyOneTimePassword} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
        {errorMessage && (
          <p className="text-danger fs-5 fw-bold mt-3" aria-live="polite">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default Verify2FA;
