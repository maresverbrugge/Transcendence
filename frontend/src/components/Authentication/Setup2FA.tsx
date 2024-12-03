import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate } from 'react-router-dom';

const SetUp2FA = () => {
	const navigate = useNavigate();
  const location = useLocation();
  const [qrcodeUrl, setQrcodeUrl] = useState(null);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const userID = location.state?.userID;
    if (!userID) {
      console.error('Error getting userID from location');
      setErrorOccurred(true);
      return;
    }

    if (!isFetched) {
      axios.post('http://localhost:3001/two-factor/qrcode', { userID })
        .then(response => {
					console.log('response:', response);
          setQrcodeUrl(response.data);
          setIsFetched(true);
        })
        .catch(err => {
          setQrcodeUrl(null);
          setErrorOccurred(true);
          console.error('Error while setting up 2FA:', err);
          try {
            axios.post('http://localhost:3001/two-factor/disable', { userID });
          } catch (disableErr) {
            console.error('Error while disabling 2FA:', disableErr);
          }
        });
    }
  }, [location.state?.userID, isFetched]);

  const enable2FA = (userID: number) => {
    axios.post('http://localhost:3001/two-factor/enable', { userID })
      .catch(error => {
        console.error('Error while enabling 2FA:', error);
        setErrorOccurred(true);
      });
			navigate('/account');
  };

  if (!isFetched && !errorOccurred) {
    return <SingleHeader text="Loading..." />;
  } else if (qrcodeUrl != null && !errorOccurred) {
    return (
      <div>
				<p>Scan the QR code below with Google Authenticator to set up 2FA:</p>
				<div>
					<img src={qrcodeUrl} alt="QR Code for 2FA setup" />
				</div>
				<div>
					<button
						className="btn btn-primary"
						onClick={() => enable2FA(location.state?.userID)}>
						Done
					</button>
				</div>
      </div>
    );
  } else {
    return <SingleHeader text="Error occurred while setting up 2FA" />;
  }
};

export default SetUp2FA;