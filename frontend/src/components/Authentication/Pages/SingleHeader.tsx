import React from 'react';

interface SingleHeaderProps {
  text: string;
}

const SingleHeader: React.FC<SingleHeaderProps> = ({ text }) => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <h1>{text}</h1>
    </div>
  );
};

export default SingleHeader;
