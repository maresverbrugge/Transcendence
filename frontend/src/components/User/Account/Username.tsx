import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';

const Username = ({currentUsername}: {currentUsername: string} ) => {
  const [username, setUsername] = useState<string>(currentUsername);
  const [tempUsername, setTempUsername] = useState<string>(currentUsername);
  const [previousUsername, setPreviousUsername] = useState<string>(currentUsername);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const validateUsername = (value: string): string | null => {
    if (!value.trim()) return 'Username cannot be empty!';
    if (value.length > 15) return 'Username must not exceed 15 characters!';
    if (/[^a-zA-Z0-9-_]/.test(value)) return 'Username can only contain letters, numbers, dashes, and underscores.';
    return null;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempUsername(value);
    const validationError = validateUsername(value);
    setValidationMessage(validationError);
  };

  const handleCancel = () => {
    setTempUsername(username);
    setValidationMessage(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (validationMessage || !tempUsername.trim()) {
      setValidationMessage('Please resolve validation errors before saving.');
      return;
    }
    setUploadStatus('saving');
    try {
      const token = localStorage.getItem('authenticationToken');
      await axios.patch(`http://localhost:3001/user/${token}`, { username: tempUsername });
      setUsername(tempUsername); // Save old username for undo
      setPreviousUsername(username); // Update to new username
      setIsEditing(false);
      setUploadStatus('success');
    } catch (error) {
      console.error('Error updating username:', error);
      setUploadStatus('error');
    }
  };

  const handleUndo = () => {
    setUsername(previousUsername);
    setIsEditing(false);
    setUploadStatus('idle');
  };

  return (
    <div className="username-component d-flex flex-column align-items-center">
      {isEditing ? (
        <>
          {/* Input Field with Validation */}
          <div className="mb-2 w-100" style={{ maxWidth: '22ch' }}>
          <input
            type="text"
            value={tempUsername}
            onChange={handleInputChange}
            className={`form-control text-center ${validationMessage ? 'is-invalid' : tempUsername.trim() ? 'is-valid' : ''}`}
            placeholder="Enter new name"
            style={{
              width: '100%', // Make width responsive
              paddingInline: '5%', // Adjust padding based on container width
              boxSizing: 'border-box', // Ensure borders and padding are included in width
            }}
          />
          
          {validationMessage ? (
            <div
              className="invalid-feedback text-center"
              style={{
                width: '100%', // Full width of the container
                maxWidth: '90%', // Prevent it from exceeding the layout
                margin: '0 auto', // Center the message within the parent
                padding: '0.5%', // Responsive padding
                boxSizing: 'border-box', // Ensures padding doesn't affect width
              }}
            >
              {validationMessage}
            </div>
          ) : (
            tempUsername.trim() && (
              <div
                className="valid-feedback text-center"
                style={{
                  width: '100%',
                  maxWidth: '90%',
                  margin: '0 auto',
                  padding: '0.5%',
                  boxSizing: 'border-box',
                }}
              >
                Username looks good!
              </div>
            )
          )}
          </div>

          {/* Cancel and Save Buttons */}
          <div className="mt-1">
            <button
              type="button"
              className="btn btn-danger btn-sm me-2"
              onClick={handleCancel}>
              Cancel
            </button>

            <button
              className="btn btn-warning btn-sm"
              onClick={handleSave}>
              {uploadStatus === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </>
      ) : (
        <>
        <h2>{username}</h2>
          {/* Edit Button */}
          <button
            className="btn btn-outline-primary btn-sm mb-3"
            onClick={() => {
              setIsEditing(true);
              setUploadStatus('idle');}}>
            Edit Username
          </button>

          {/* Undo Button */}
          {uploadStatus === 'success' && (
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={handleUndo}>
              Reset
            </button>
          )}
        </>
      )}

      {/* Status Messages */}
      {uploadStatus === 'saving' && <p className="text-info mt-3">Saving...</p>}
      {uploadStatus === 'error' && (<p className="text-danger mt-3">Failed to update username. Please try again.</p>)}
      {uploadStatus === 'success' && (<p className="text-success mt-3">Username updated successfully!</p>)}
    </div>
  );
}

export default Username;
