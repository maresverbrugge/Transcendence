import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface TwoFactorAuthenticationProps {
  twoFactorAuthenticationEnabled: boolean;
  userID: number;
}

const Toggle2FA: React.FC<TwoFactorAuthenticationProps> = ({ twoFactorAuthenticationEnabled, userID }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(twoFactorAuthenticationEnabled);

  useEffect(() => {
    setTwoFactorEnabled(twoFactorAuthenticationEnabled);
  }, [twoFactorAuthenticationEnabled]);

  const enable2FA = async () => {
    window.location.href = `/login/2fa?userID=${userID}`;
  };

  const disable2FA = async () => {
    try {
      const response = await axios.post('http://localhost:3001/two-factor/disable', { userID });
      console.log('2FA disabled:', response.data); // For debugging
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
