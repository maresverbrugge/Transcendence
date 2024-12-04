import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { disableTwoFactor } from '../../Authentication/apiCalls.tsx';

interface TwoFactorAuthenticationProps {
  twoFactorAuthenticationEnabled: boolean;
  userID: number;
}

const Toggle2FA: React.FC<TwoFactorAuthenticationProps> = ({ twoFactorAuthenticationEnabled, userID }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(twoFactorAuthenticationEnabled);
  const navigate = useNavigate();

  useEffect(() => {
    setTwoFactorEnabled(twoFactorAuthenticationEnabled);
  }, [twoFactorAuthenticationEnabled]);

  const enable2FA = async () => {
    navigate('/login/set-up-2fa', { state: { userID } });
  };

  const disable2FA = async () => {
    try {
      await disableTwoFactor(userID);
      setTwoFactorEnabled(false);
      alert('Two-factor authentication has been disabled successfully.');
    } catch (error) {
      console.error('Error while disabling 2FA:', error);
    }
  };

  return (
    <button
      className="btn btn-outline-primary btn-sm mb-2"
      onClick={twoFactorEnabled ? disable2FA : enable2FA}>
      {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
    </button>
  );
};

export default Toggle2FA;
