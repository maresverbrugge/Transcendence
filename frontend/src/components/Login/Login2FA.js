import React, { useEffect, useState } from 'react';
import axios from 'axios';

const twoFactorAuthenticationEnabled = false; // This should be a database value

const Login2FA = () => {

	const start2FA = () => {
		// Do the authentication
	}

	const handleSetup2FA = () => {
		// Redirect to 2FA setup page
	}

	const handleSkip2FA = () => {
		window.location.href = '/game';
	}

	if (twoFactorAuthenticationEnabled) {
		start2FA();
	}
	else {
		return (
			<div>
				<p>Do you want to set up 2FA?</p>
				<button onClick={handleSetup2FA}>Yes</button>
				<button onClick={handleSkip2FA}>Skip</button>
			</div>
		);
	}
}

export default Login2FA;