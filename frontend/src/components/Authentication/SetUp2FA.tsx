import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import SingleHeader from './Pages/SingleHeader';
import { getQRCode } from '../Utils/apiCalls';
import Enable2FA from './Enable2FA';
import { emitter } from '../emitter';

const SetUp2FA = () => {
  const navigate = useNavigate();
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [codeIsFetched, setCodeIsFetched] = useState<boolean>(false);
  const [userScannedQRCode, setUserScannedQRCode] = useState<boolean>(false);

  useEffect(() => {
    const displayQRCode = async () => {
      try {
        const token = localStorage.getItem('authenticationToken');
        if (!token) throw new Error('Authentication token not found');
        const response = await getQRCode(token);
        setQrcodeUrl(response.data);
        setCodeIsFetched(true);
      } catch (error) {
        emitter.emit('error', error);
        navigate('/main');
        return;
      }
    };

    if (!codeIsFetched) {
      displayQRCode();
    }
  }, [codeIsFetched]);

  if (!codeIsFetched) {
    return <SingleHeader text="Loading..." />;
  } else if (userScannedQRCode) {
    return <Enable2FA />;
  } else {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card shadow d-flex justify-content-center align-items-center m-4 p-3">
          <h2>Set up 2FA</h2>
          <ol>
            <li>Install the Google Authenticator app on your phone.</li>
            <li>Scan the QR code below with the Google Authenticator app.</li>
          </ol>
          <img src={qrcodeUrl} className="img-fluid" style={{ width: '300px' }} />
          <button
            className="btn btn-primary w-30 fs-4 fw-bold mt-3"
            onClick={() => setUserScannedQRCode(true)}
          >
            Done
          </button>
        </div>
      </div>
    );
  }
};

export default SetUp2FA;
