import React from 'react';
import './Confirm.css';

const Confirm = ({ message, onOK, onCancel }) => {
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