import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // extract dynamic parameters from the current URL
import UserProfile from '../components/UserProfile.tsx';

// Interface for the URL parameters
interface Params extends Record<string, string | undefined> {
  ID: string;
}

const UserAccount: React.FC = () => {
  const { ID } = useParams<Params>();
  const [currentID, setCurrentID] = useState<number | null>(null);

  useEffect(() => {
    if (ID) {
      setCurrentID(Number(ID));
    }
  }, [ID]);

  return (
    <div>
      <h2>Your Account</h2>
      {currentID ? <UserProfile userId={currentID} /> : <p>Loading user...</p>}
    </div>
  );
}

export default UserAccount;
