import React, { useState } from 'react';
import axios from 'axios';

function Toggle2FA() {
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);

  const handleToggleTwoFactor = async (enable:boolean) => {
    try {
      const token = localStorage.getItem('authenticationToken');
      const response = await axios.patch(`http://localhost:3001/user/${token}/2fa`, {
        enable,
      });
      setIsTwoFactorEnabled(response.data.Enabled2FA); // Update 2FA status
      console.log('2FA status updated successfully', response.data);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    }
  };

  return (
    <div className="btn-group" role="group" aria-label="2FA toggle button group">
      <input
        type="radio"
        className="btn-check"
        name="btnradio"
        id="btnEnable2FA"
        autoComplete="off"
        checked={isTwoFactorEnabled}
        onChange={() => handleToggleTwoFactor(true)}/>
      <label className="btn btn-outline-primary" htmlFor="btnEnable2FA">
        Enable 2FA
      </label>

      <input
        type="radio"
        className="btn-check"
        name="btnradio"
        id="btnDisable2FA"
        autoComplete="off"
        checked={!isTwoFactorEnabled}
        onChange={() => handleToggleTwoFactor(false)}/>
      <label className="btn btn-outline-primary" htmlFor="btnDisable2FA">
        Disable 2FA
      </label>
    </div>
  );
};

export default Toggle2FA;
