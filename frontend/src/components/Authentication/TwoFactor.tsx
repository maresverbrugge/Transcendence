import React, { useState } from 'react';
import axios from 'axios';

const Login2FA = () => {
	const [twoFactorAuthenticationEnabled, setTwoFactorAuthenticationEnabled] = useState(false);
	const [qrcodeUrl, setQrcodeUrl] = useState(null);
	const [oneTimePassword, setOneTimePassword] = useState('');
	const [passwordVerified, setPasswordVerified] = useState(false);

	const setup2FA = () => {
		axios.get('http://localhost:3001/two-factor/qrcode', {
		})
		.then(response => {
			setTwoFactorAuthenticationEnabled(false);
			setQrcodeUrl(response.data);
		})
		.catch(err => {
			console.error('Error while setting up 2FA:', err);
		});
	}

	const skip2FA = () => {
		window.location.href = '/main';
	}

	const enable2FA = () => {
		setTwoFactorAuthenticationEnabled(true);
	}

	const verifyOneTimePassword = () => {
		axios.post('http://localhost:3001/two-factor/verify', {
			oneTimePassword: oneTimePassword
		})
		.then(response => {
			console.log('Verified:', response.data); // For debugging
			setPasswordVerified(response.data);
		})
		.catch(err => {
			console.error('Error while verifying one time password:', err);
		});
	}

	if (!twoFactorAuthenticationEnabled && qrcodeUrl == null) {
		return (
			<div>
				<p>Do you want to set up 2FA?</p>
				<button onClick={setup2FA}>Yes</button>
				<button onClick={skip2FA}>Skip</button>
			</div>
		);
	}
	else if (!twoFactorAuthenticationEnabled && qrcodeUrl != null) {
		return (
			<div>
				<img src={qrcodeUrl}/>
				<p>Scan this QR code to set up 2FA with your 2FA app</p>
				<button onClick={enable2FA}>Done</button>
				<button onClick={skip2FA}>Skip</button>
			</div>
		)
	}
	else if (twoFactorAuthenticationEnabled && !passwordVerified) {
		return (
			<div>
				<p>Enter your one time password:</p>
				<input 
					type="text"
					value={oneTimePassword}
					onChange={(e) => setOneTimePassword(e.target.value)}
				/>
				<button onClick={verifyOneTimePassword}>Submit</button>
			</div>
		);
	}
	else if (twoFactorAuthenticationEnabled && passwordVerified) {
		return (
			<div>
				<p>Successful login!</p>
			</div>
		);
	}
	else {
		return (
			<div>
				<p>2FA error! Saddd</p>
			</div>
		);
	}
}

export default Login2FA;