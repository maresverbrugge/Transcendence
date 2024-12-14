import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, enableTwoFactor } from '../Utils/apiCalls';

const Enable2FA = () => {
  const navigate = useNavigate();
  const [oneTimePassword, setOneTimePassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [navigateToAccount, setNavigateToAccount] = useState<boolean>(false);

  useEffect(() => {
    if (navigateToAccount) {
      navigate('/account');
    }
  }, [navigateToAccount, navigate]);

  const handleVerifyAndEnable = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('authenticationToken');
      if (!token) throw new Error('Authentication token not found');
      const response = await verifyOTP(token, oneTimePassword);
      const verified = response.data;
      if (!verified) throw new Error('Invalid one-time password');
      await enableTwoFactor(token);
      navigate('/account');
    } catch (error) {
      console.error('Error verifying one-time password:', error);
      setErrorMessage('Error verifying one-time password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow d-flex justify-content-center align-items-center p-3 m-3">
      <p>Enter a one-time password to verify that set-up was successful:</p>

      <input
        type="text"
        value={oneTimePassword}
        onChange={(e) => setOneTimePassword(e.target.value)}
        placeholder="Enter OTP"
      />

      <button style={{ width: '150px', margin: '20px' }} onClick={handleVerifyAndEnable} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>

      {errorMessage && (
        <p style={{ color: 'red' }} aria-live="polite">
          {errorMessage}
        </p>
      )}

      <button
        style={{ width: '150px', margin: '10px' }}
        onClick={() => setNavigateToAccount(true)}
        disabled={isLoading}
      >
        Cancel 2FA Setup
      </button>
    </div>
  );
};

export default Enable2FA;
