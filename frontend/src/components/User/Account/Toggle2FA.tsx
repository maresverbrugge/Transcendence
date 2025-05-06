import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emitter } from '../../emitter';
import { disableTwoFactor } from '../../Utils/apiCalls';

const Toggle2FA = ({ twoFactorAuthenticationEnabled }: { twoFactorAuthenticationEnabled: boolean }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(twoFactorAuthenticationEnabled);
  const navigate = useNavigate();

  useEffect(() => {
    setTwoFactorEnabled(twoFactorAuthenticationEnabled);
  }, [twoFactorAuthenticationEnabled]);

  const enable2FA = async () => {
    navigate('/login/set-up-2fa');
  };

  const disable2FA = async () => {
    try {
      const token = localStorage.getItem('authenticationToken');
      if (!token) throw new Error('Authentication token not found');
      await disableTwoFactor(token);
      setTwoFactorEnabled(false);
      alert('Two-factor authentication has been disabled successfully.');
    } catch (error) {
      console.error('Error while disabling 2FA:', error);
      emitter.emit("error", error);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <p>Two-factor authentication is currently {twoFactorEnabled ? 'enabled' : 'disabled'}.</p>
      <button className="btn btn-outline-primary btn-sm mb-2" onClick={twoFactorEnabled ? disable2FA : enable2FA}>
        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
      </button>
    </div>
  );
};

export default Toggle2FA;
