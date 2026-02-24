import { useEffect, useState } from "react";
import { getFriendRequests, acceptFriendRequest } from "../api/friends";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getFriendRequests().then(setRequests);
  }, []);

  return (
    <div>
      <h3>👥 Friend Requests</h3>

      {requests.map((req) => (
        <div key={req.id}>
          <span>{req.senderName}</span>
          <button onClick={() => acceptFriendRequest(req.id)}>Accept</button>
        </div>
      ))}
    </div>
  );
}
