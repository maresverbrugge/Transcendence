import { useEffect, useState } from 'react';
import axios from 'axios';

const getIntraNameHook = () => {
  const [intraName, setIntraName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authenticationToken');
    if (!token) {
      return null;
    } else {
      axios
        .post('http://localhost:3001/login/intra-name', {
          token,
        })
        .then((response) => {
          setIntraName(response.data);
        })
        .catch((err) => {
          console.error('Error getting intra name:', err);
          setIntraName(null);
        });
    }
  }, []);

  return intraName;
};

export default getIntraNameHook;
