import React, { useState } from 'react';
import { MemberData } from '../interfaces.tsx'
import './NewChannel.css';
import axios from 'axios';

interface NewDMProps {
    friends: MemberData[];
    selectChannel: (channelID: number) => void;
    socket: any;
    token: string;
    setAlert: (message: string) => void;
}

const NewDM = ({ friends, selectChannel, socket, token, setAlert }: NewDMProps) => {
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [selectedFriend, setSelectedFriend] = useState<MemberData | null>(null);

    const handleCreateDM = async () => {
        if (!selectedFriend) {
            setAlert("Please select a friend to start a DM!");
            return;
        }

        const newChannelData = {
            name: '',
            isPrivate: true,
            isDM: true,
            password: null,
            token,
            memberIDs: [selectedFriend.ID],
        };
        const response = await axios.post('http://localhost:3001/chat/channel', {newChannelData})
        socket.emit('newChannel', response.data);
        resetForm();
        selectChannel(response.data.ID)
    };

    const resetForm = () => {
        setIsCreating(false);
        setSelectedFriend(null);
    };

    return (
        <>
            <button className="new-dm-button" onClick={() => setIsCreating(true)}>
                Create New DM
            </button>

            {isCreating && (
                <div className="new-channel-overlay">
                    <div className="new-channel-form">
                        <h3>Select a Friend for the DM</h3>
                        <div>
                            {friends.map((friend) => (
                                <label key={friend.ID}>
                                    <input
                                        type="radio"
                                        name="friendSelection"
                                        checked={selectedFriend?.ID === friend.ID}
                                        onChange={() => setSelectedFriend(friend)}
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
