import { sendFriendRequest } from "../api/friends";

export default function UserCard({ user }) {
  const handleSend = async () => {
    await sendFriendRequest(user.id);
    alert("Friend request sent");
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 10 }}>
      <h4>{user.username}</h4>
      <button onClick={handleSend}>Add Buddy</button>
    </div>
  );
}
