import React, { useEffect, useState } from 'react';
import axios from 'axios';

const twoFactorAuthenticationEnabled = false; // This should be a database value

const Login2FA = () => {
	const [qrcodeUrl, setQrcodeUrl] = useState(null);

	const start2FA = () => {
		// Do the authentication
	}

	const handleSetup2FA = () => {
		axios.post('http://localhost:3001/two-factor/callback', {
			something: "yay we made it"
		})
		.then(response => {
			console.log('response', response.data);
			setQrcodeUrl(response.data);
		})
		.catch(err => {
			console.error('Error while setting up 2FA:', err);
		});
	}

	const handleSkip2FA = () => {
		window.location.href = '/game';
	}

	if (twoFactorAuthenticationEnabled) {
		start2FA();
	}
	else if (qrcodeUrl) {
		return (
			<div>
				<img src={qrcodeUrl}/>
				<p>Scan this QR code with your 2FA app</p>
			</div>
		)
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