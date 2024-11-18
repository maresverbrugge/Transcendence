{/* Enable/disable 2FA Button */}
<div>
<h4>2FA Status</h4>
<p>{isTwoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}</p>
<button onClick={handleToggleTwoFactor}>
  {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
</button>
</div>