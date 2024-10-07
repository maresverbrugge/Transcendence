// UserList Component
const UserList = ({ userList, sendChatInvite }) => {
    if (!userList) { return }
    return (
        <div>
            <h1>Online:</h1>
            <ul>
                {userList.map((user) => (
                    <li key={user.id}>
                        {user.username}
                        <button onClick={() => sendChatInvite(user.username)}>Send Chat Invite</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;