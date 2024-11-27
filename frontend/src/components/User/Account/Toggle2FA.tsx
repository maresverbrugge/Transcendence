import React, { useState } from 'react';
import axios from 'axios';

function Toggle2FA() {
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);

  const handleToggleTwoFactor = async () => {
    try {
      const token = localStorage.getItem('authenticationToken');
      const response = await axios.patch(`http://localhost:3001/user/${token}/2fa`, {
        enable: !isTwoFactorEnabled,
      });
      setIsTwoFactorEnabled(response.data.Enabled2FA); // Update 2FA status
      console.log('2FA status updated successfully', response.data);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    }
  };

  return (
    <div className="toggle-2FA">
    {/* Enable/disable 2FA Button */}
    <h4>2FA Status</h4>
    <p>{isTwoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}</p>
    <button class="btn btn-warning" onClick={handleToggleTwoFactor}>
      {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
    </button>
    </div>
  );
};

export default Toggle2FA;
