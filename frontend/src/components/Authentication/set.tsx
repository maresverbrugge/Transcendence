import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SingleHeader from './Pages/SingleHeader.tsx';
import { getQRCode, enableTwoFactor } from './apiCalls.tsx';

interface LocationState {
  userID: string;
}

const SetUp2FA = () => {
	const navigate = useNavigate();
  const location = useLocation<LocationState>();
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);
  const [codeIsFetched, setCodeIsFetched] = useState<boolean>(false);

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

  const enable2FA = async (userID: number) => {
		try {
			await enableTwoFactor(userID);
			navigate('/account');

		} catch (error) {
      console.error('Error while enabling 2FA:', error);
      setErrorOccurred(true);
		}
  };

	if (errorOccurred) {
		return <SingleHeader text="Error occurred while setting up 2FA" />;
	} else if (!codeIsFetched) {
    return <SingleHeader text="Loading..." />;
  } else {
    return (
			<div className="card shadow d-flex justify-content-center align-items-center p-3 m-3">
				<p>Scan the QR code below with Google Authenticator to set up 2FA</p>
				<img src={qrcodeUrl} className="img-fluid" style={{ width: '300px' }} />
				<button
					style={{ width: '200px', marginTop: '30px' }}
					className="btn btn-primary btn-sm"
					onClick={() => enable2FA(location.state?.userID)}>
					Done
				</button>
			</div>
    );
  } 
};

export default SetUp2FA;