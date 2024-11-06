import React, { useEffect, useState } from 'react';
import UserProfile from '../components/UserProfile';

function UserAccount() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Simulate fetching the user ID from a session or context
    const fakeUserId = 1; // Replace with actual logic if available
    setUserId(fakeUserId);
  }, []);

  return (
    <div>
      <h2>Your Account</h2>
      {userId ? <UserProfile userId={userId} /> : <p>Loading user...</p>}
    </div>
  );
}

export default UserAccount;
