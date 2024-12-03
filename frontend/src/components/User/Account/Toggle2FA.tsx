import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    navigate('/login/2fa', { state: { userID } });
  };

  const disable2FA = async () => {
    try {
      const response = await axios.post('http://localhost:3001/two-factor/disable', { userID });
      setTwoFactorEnabled(false);
    } catch (err) {
      console.error('Error while disabling 2FA:', err);
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
