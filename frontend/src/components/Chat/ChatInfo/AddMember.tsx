import React, { useState } from 'react';
import { MemberData, ChannelData } from '../interfaces.tsx'
import './AddMember.css'; // Update the CSS file name if necessary
import axios from 'axios';

interface AddMemberProps {
    channel: ChannelData;
    friends: MemberData[];
    socket: any;
    token: string;
    setAlert: (message: string) => void;
}

const AddMember = ({channel, friends, socket, token, setAlert }: AddMemberProps) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [selectedFriend, setSelectedFriend] = useState<MemberData | null>(null);

    const handleAddMember = async () => {
        if (!selectedFriend) {
            setAlert("Please select a friend to add to the channel!");
            return;
        }

        const newMemberData = {
            channelID: channel.ID,
            memberID: selectedFriend.ID,
            token,
        };
        try {
            await axios.post('http://localhost:3001/chat/channel/newMember', {newMemberData})
            socket.emit('updateChannel', selectedFriend.ID);
        } catch (error) {
            console.error(error)
        }
        resetForm();
    };

    const resetForm = () => {
        setIsAdding(false);
        setSelectedFriend(null);
    };

    return (
        <>
            {/* Always-visible button */}
            <button className="new-member-button" onClick={() => setIsAdding(true)}>
                Add Member
            </button>

            {/* Overlay and form */}
            {isAdding && (
                <div className="new-member-overlay">
                    <div className="new-member-form">
                        <h3>Select a Friend to add to the Channel</h3>
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
                        <button onClick={handleAddMember}>Done</button>
                        <button onClick={resetForm}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddMember;
