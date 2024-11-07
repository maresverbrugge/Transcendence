import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // extract dynamic parameters from the current URL
import UserProfile from '../components/UserProfile';

function UserAccount() {
  const { ID } = useParams();
  console.log("URL ID:", ID);
  const [currentID, setCurrentID] = useState(null);

  useEffect(() => {
    if (ID) {
      setCurrentID(Number(ID));
      console.log("Current User ID set to:", ID);
    }
  }, [ID]);

  console.log("currentID:", currentID);

  return (
    <div>
      <h2>Your Account</h2>
      {currentID ? <UserProfile userId={currentID} /> : <p>Loading user...</p>}
    </div>
  );
}

export default UserAccount;
