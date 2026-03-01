import axios from "axios";
import { FRIEND_SERVICE_URL, buildApiUrl } from "./config";


const friendsApi = axios.create({
  baseURL: FRIEND_SERVICE_URL,
});

friendsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

friendsApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");
        const res = await axios.post(buildApiUrl("/token/refresh/"), {
          refresh: refreshToken,
        });
        const newAccess = res.data?.access;
        if (!newAccess) throw new Error("No access token returned");
        localStorage.setItem("accessToken", newAccess);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return friendsApi(originalRequest);
      } catch (_err) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default friendsApi;


const FRIEND_API = FRIEND_SERVICE_URL;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") || localStorage.getItem("token") || ""}`,
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


