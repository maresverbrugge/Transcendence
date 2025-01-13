import React from 'react';
import { useNavigate } from 'react-router-dom';

const GoBackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/main');
  };

  return (
    <button
      onClick={handleGoBack}
      className="btn btn-outline-primary position-absolute top-0 start-0 m-3">
      &larr; Back to Main Page
    </button>
  );
};

export default GoBackButton;
