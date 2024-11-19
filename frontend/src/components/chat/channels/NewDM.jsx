import React, { useState } from 'react';
import './NewChannel.css'; // Update the CSS file name if necessary

const NewDM = ({ friends, socket, token, setAlert }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null); // For selecting a single friend

    const handleCreateDM = () => {
        if (!selectedFriend) {
            setAlert("Please select a friend to start a DM!");
            return;
        }

        const newDMData = {
            name: '',
            isPrivate: true,
            isDM: true,
            password: null,
            token,
            memberIDs: [selectedFriend.id],
        };

        socket.emit('newChannel', newDMData);
        resetForm();
    };

    const resetForm = () => {
        setIsCreating(false);
        setSelectedFriend(null);  // Reset selected friend
    };

    return (
        <>
            {/* Always-visible button */}
            <button className="new-dm-button" onClick={() => setIsCreating(true)}>
                Create New DM
            </button>

            {/* Overlay and form */}
            {isCreating && (
                <div className="new-channel-overlay">
                    <div className="new-channel-form">
                        <h3>Select a Friend for the DM</h3>
                        <div>
                            {friends.map((friend) => (
                                <label key={friend.id}>
                                    <input
                                        type="radio"
                                        name="friendSelection"
                                        checked={selectedFriend?.id === friend.id} // Safely check selectedFriend
                                        onChange={() => setSelectedFriend(friend)} // Select a friend
                                    />
                                    {friend.username}
                                </label>
                            ))}
                        </div>
                        <button onClick={handleCreateDM}>Done</button>
                        <button onClick={resetForm}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewDM;
