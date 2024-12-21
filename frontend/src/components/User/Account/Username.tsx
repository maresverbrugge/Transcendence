import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

function Username({ currentUsername }: { currentUsername: string }) {
  const [username, setUsername] = useState<string>(currentUsername);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [buttonVisible, setButtonVisible] = useState<boolean>(true); // Controls button visibility
  const [inputError, setInputError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);

    // Basic validation
    if (!newUsername.trim()) {
      setInputError("Username cannot be empty!");
    } else if (newUsername.length > 20) {
      setInputError("Username cannot exceed 20 characters.");
    } else {
      setInputError(null);
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername);
    setIsEditing(false);
    setInputError(null);
    setUploadStatus('idle');
    setButtonVisible(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inputError || !username.trim()) {
      setInputError("Please fix the errors before saving.");
      return;
    }

    setUploadStatus('uploading');
    setButtonVisible(false);

    try {
      const token = localStorage.getItem('authenticationToken');
      await axios.patch(`http://localhost:3001/user/${token}`, {
        username: username.trim(),
      });

      setUploadStatus('success');
      setIsEditing(false);

      // Fetch updated username (optional, if needed)
      // const response = await axios.get(`http://localhost:3001/user/${token}`);
      // setUsername(response.data.username);

    } catch (err) {
      setUploadStatus('error');
      console.error('Error updating username:', err);
    }
  };

  return (
    <div className="username-component d-flex flex-column align-items-center">
      {/* Displaying Current Username */}
      {!isEditing ? (
        <div>
          <h2>{username}</h2>
          <button
            className="btn btn-outline-primary btn-sm mb-2"
            onClick={() => setIsEditing(true)}>
            Edit Username
          </button>
        </div>
      ) : (
        <div>
          <label htmlFor="username-input" className="form-label">
            Update your username
          </label>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={handleInputChange}
            className={`form-control ${inputError ? 'is-invalid' : ''}`}
            placeholder="Enter new username"
          />
          {inputError && <div className="invalid-feedback">{inputError}</div>}

          {/* Conditional Buttons */}
          {buttonVisible && (
            <div className="mt-3 d-flex gap-2 justify-content-between">
              <button
                className="btn btn-danger btn-sm me-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={handleSubmit}
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Feedback */}
      {uploadStatus === 'uploading' && <p className="text-info mb-2">Uploading...</p>}
      {uploadStatus === 'success' && <p className="text-success mb-2">Username updated successfully!</p>}
      {uploadStatus === 'error' && <p className="text-danger mb-2">Failed to update username. Please try again.</p>}
    </div>
  );
}

export default Username;
