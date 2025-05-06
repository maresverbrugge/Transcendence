import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOTP, enableTwoFactor } from '../Utils/apiCalls';
import GoBackButton from '../GoBackButton';

const Enable2FA = () => {
  const navigate = useNavigate();
  const [oneTimePassword, setOneTimePassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [navigateToAccount, setNavigateToAccount] = useState<boolean>(false);

  useEffect(() => {
    if (navigateToAccount) {
      navigate('/profile');
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
      navigate('/profile');
    } catch (error) {
      setErrorMessage('Invalid password! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <GoBackButton />
      <div className="card shadow d-flex justify-content-center align-items-center m-4 p-3">
        <p>Enter a one-time password to verify that set-up was successful:</p>

        <input
          type="text"
          className="form-control w-50 fs-5 fw-bold mt-2"
          value={oneTimePassword}
          onChange={(e) => setOneTimePassword(e.target.value)}
          placeholder="Enter OTP"/>

        <button
          className="btn btn-primary w-30 fs-5 fw-bold mt-3"
          onClick={handleVerifyAndEnable} disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>

        {errorMessage && (
          <p className="text-danger fs-5 fw-bold mt-3" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <button
          className="btn btn-primary w-30 fs-5 fw-bold mt-3"
          onClick={() => setNavigateToAccount(true)}
          disabled={isLoading}>
          Cancel 2FA Setup
        </button>
      </div>
    </div>
  );
};

export default Enable2FA;
