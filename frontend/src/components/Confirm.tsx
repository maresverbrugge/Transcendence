import React from 'react';
import './Confirm.css';

interface ConfirmProps {
  message: string;
  onOK: () => void;
  onCancel: () => void;
}

const Confirm = ({ message, onOK, onCancel }: ConfirmProps) => {
    return (
        <div className="confirm-overlay">
            <div className="confirm-box">
                <p>{message}</p>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onOK}>OK</button>
            </div>
        </div>
    );
};

export default Confirm;
