import React, { useState } from 'react';
import axios from 'axios';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useLocation } from 'react-router-dom';

const SetUp2FA = () => {
	const location = useLocation();
	const userID = location.state.userID;
	const [qrcodeUrl, setQrcodeUrl] = useState(null);
	const [errorOccurred, setErrorOccurred] = useState(false);

	axios.post('http://localhost:3001/two-factor/qrcode', {
		userID: userID,
	})
	.then(response => {
		setQrcodeUrl(response.data);
	})
	.catch(err => {
		setQrcodeUrl(null);
		setErrorOccurred(true);
		console.error('Error while setting up 2FA:', err);
		try {
			axios.post('http://localhost:3001/two-factor/disable', { userID });
		}
		catch (error) {
			console.error('Error while disabling 2FA:', err);
		}
	});

	const enable2FA = (userID: number) => {
		axios.post('http://localhost:3001/two-factor/enable', { userID })
		.catch(error => {
			console.error('Error while enabling 2FA:', error);
			setErrorOccurred(true);
		});
	};

	if (qrcodeUrl == null && !errorOccurred) {
		return <SingleHeader text="Loading..." />;
	}
	else if (qrcodeUrl != null && !errorOccurred) {
		return (
			<div>
				<img src={qrcodeUrl}/>
				<p>Scan this QR code to set up 2FA with your 2FA app</p>
				<button onClick={() => enable2FA(userID)}>Done</button>
			</div>
		)
	}
	else {
		return <SingleHeader text="Error occurred while setting up 2FA" />;
	}
}

export default SetUp2FA;