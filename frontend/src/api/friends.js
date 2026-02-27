import axios from "axios";
import { FRIEND_SERVICE_URL } from "./config";


const friendsApi = axios.create({
  baseURL: FRIEND_SERVICE_URL,
});

export default friendsApi;


const FRIEND_API = FRIEND_SERVICE_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 1. Get all users (Buddy Finder list)
export async function getAllUsers() {
  const res = await fetch(`${FRIEND_API}/users/discover`, {
    headers: authHeaders(),
  });
  return res.json();
}

// 2. Send friend request
export async function sendFriendRequest(receiverId) {
  const res = await fetch(`${FRIEND_API}/friends/request`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ receiverId }),
  });
  return res.json();
}

// 3. Get pending friend requests
export async function getFriendRequests() {
  const res = await fetch(`${FRIEND_API}/friends/list`, {
    headers: authHeaders(),
  });
  return res.json();
}

// 4. Accept request
export async function acceptFriendRequest(requestId) {
  const res = await fetch(`${FRIEND_API}/friends/accept`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId }),
  });
  return res.json();
}


