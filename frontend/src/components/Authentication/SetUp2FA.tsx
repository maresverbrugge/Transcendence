import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SingleHeader from './Pages/SingleHeader.tsx';
import { getQRCode } from './apiCalls.tsx';
import Enable2FA from './Enable2FA.tsx';

const SetUp2FA = () => {
  const location = useLocation();
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);
  const [codeIsFetched, setCodeIsFetched] = useState<boolean>(false);
	const [userScannedQRCode, setUserScannedQRCode] = useState<boolean>(false);

  useEffect(() => {
    const userID = location.state?.userID;
    if (!userID) {
      console.error('Error getting userID from location');
      setErrorOccurred(true);
      return;
    }

		const displayQRCode = async (userID: number) => {
			try {
				const response = await getQRCode(userID);
				setQrcodeUrl(response.data);
				setCodeIsFetched(true);
			} catch (error) {
				setQrcodeUrl(null);
				setErrorOccurred(true);
				console.error('Error while setting up 2FA:', error);
			}
		}

    if (!codeIsFetched) {
			displayQRCode(userID);
		}
  }, [location.state, codeIsFetched]);

	if (errorOccurred) {
		return <SingleHeader text="Error occurred while setting up 2FA" />;
	} else if (!codeIsFetched) {
    return <SingleHeader text="Loading..." />;
  } else if (userScannedQRCode) {
		return <Enable2FA userID={location.state?.userID} />;
	} else {
    return (
			<div className="card shadow d-flex justify-content-center align-items-center p-3 m-3">
				<h2>Set up 2FA</h2>
				<ol>
					<li>1. Install the Google Authenticator app on your phone.</li>
					<li>2. Scan the QR code below with the Google Authenticator app.</li>
				</ol>
				<img src={qrcodeUrl} className="img-fluid" style={{ width: '300px' }} />
				<button
					style={{ width: '200px', marginTop: '30px' }}
					className="btn btn-primary btn-sm"
					onClick={() => setUserScannedQRCode(true)}
				>
					Done
				</button>
				</div>
			);
		} 
	};
		
	export default SetUp2FA;