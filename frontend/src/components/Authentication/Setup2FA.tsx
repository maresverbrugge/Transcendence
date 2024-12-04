import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SingleHeader from './Pages/SingleHeader.tsx';
import { useNavigate } from 'react-router-dom';

interface LocationState {
  userID: string;
}

const SetUp2FA = () => {
	const navigate = useNavigate();
  const location = useLocation<LocationState>();
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
          setQrcodeUrl(response.data);
          setIsFetched(true);
        })
        .catch(err => {
          setQrcodeUrl(null);
          setErrorOccurred(true);
          console.error('Error while setting up 2FA:', err);
        });
    }
  }, [location, isFetched, errorOccurred]);

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
  } else if (errorOccurred) {
	  return <SingleHeader text="Error occurred while setting up 2FA" />;
	} else if (qrcodeUrl != null && !errorOccurred) {
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