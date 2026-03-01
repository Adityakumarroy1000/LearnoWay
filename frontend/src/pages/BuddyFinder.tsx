import { useEffect, useMemo, useState } from "react";
import friendsApi from "../api/friends";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import BuddyProfileModal from "./BuddyProfileModal";
import FriendRequests from "./FriendRequests";
import { BACKEND_BASE } from "../api/config";

interface User {
  id: number;
  djangoUserId: number;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
}

export default function BuddyFinder() {
  const location = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const [friends, setFriends] = useState<number[]>([]);
  const [requestedIds, setRequestedIds] = useState<number[]>([]);
  const [receivedIds, setReceivedIds] = useState<number[]>([]);
  const [receivedMap, setReceivedMap] = useState<Record<number, string>>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const token = localStorage.getItem("accessToken");
  const currentUserId = Number(localStorage.getItem("userId") || 0);
  const currentUsername = localStorage.getItem("username") || "";
  const currentEmail = (() => {
    try {
      const profile = JSON.parse(localStorage.getItem("userProfile") || "null");
      return (profile && (profile.email || profile.emailAddress)) || "";
    } catch (e) {
      return "";
    }
  })();

  // decode JWT payload (best-effort) to extract user info when localStorage keys are missing
  const parseJwt = (tkn?: string | null) => {
    if (!tkn) return {} as any;
    try {
      const parts = tkn.split(".");
      if (parts.length < 2) return {} as any;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {} as any;
    }
  };

  const jwtPayload = parseJwt(token);
  const jwtUserId = jwtPayload?.user_id ?? jwtPayload?.userId ?? jwtPayload?.id ?? jwtPayload?.sub;
  const jwtUsername = jwtPayload?.username ?? "";
  const jwtEmail = jwtPayload?.email ?? "";
  const openRequestsFromQuery =
    new URLSearchParams(location.search).get("requests") === "open";

  useEffect(() => {
    if (!token) return;
    friendsApi
      .get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          // filter out current user by id, username or email (robust)
            const list = (res.data || []).filter((u: any) => {
              const id = u.djangoUserId ?? u.userId ?? u.id;
              const username = u.username ?? "";
              const email = u.email ?? u.emailAddress ?? "";

              // compare against localStorage values first
              if (id && currentUserId && Number(id) === Number(currentUserId)) return false;
              if (currentUsername && username === currentUsername) return false;
              if (currentEmail && email === currentEmail) return false;

              // fallback to JWT payload values (some flows set token but not localStorage)
              if (id && jwtUserId && Number(id) === Number(jwtUserId)) return false;
              if (jwtUsername && username === jwtUsername) return false;
              if (jwtEmail && email === jwtEmail) return false;

              return true;
            });
          setUsers(list);
        })
      .catch((err) => console.error("Buddy finder error:", err));

    friendsApi
      .get("/friends/sent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const ids = res.data.map((r: any) => Number(r.receiverId));
        setRequestedIds(ids);
      });

    // fetch received requests so we can show "Respond" in the list
    friendsApi
      .get("/friends/received", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ids = res.data.map((r: any) => Number(r.senderId));
        setReceivedIds(ids);
        const map: Record<number, string> = {};
        res.data.forEach((r: any) => {
          map[Number(r.senderId)] = r.id;
        });
        setReceivedMap(map);
      })
      .catch(() => {});
  }, [token]);

  // listen for requests sent from modal (or other places)
  useEffect(() => {
    const handler = (e: any) => {
      const receiverId = Number(e?.detail?.receiverId);
      if (!Number.isNaN(receiverId)) {
        setRequestedIds((prev) => (prev.includes(receiverId) ? prev : [...prev, receiverId]));
      }
    };

    window.addEventListener("friend-request-sent", handler as EventListener);
    return () => window.removeEventListener("friend-request-sent", handler as EventListener);
  }, []);

  const sendRequest = async (receiverId: number) => {
    if (!token) return;

    try {
      await friendsApi.post(
        "/friends/request",
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestedIds((prev) =>
        prev.includes(receiverId) ? prev : [...prev, receiverId]
      );

    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (requestId: string, senderId: number) => {
    if (!token) return;
    try {
      await friendsApi.post(
        "/friends/accept",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // add to friends and remove from received/ requested
      setFriends((prev) => (prev.includes(senderId) ? prev : [...prev, senderId]));
      setReceivedIds((prev) => prev.filter((id) => id !== senderId));
      setRequestedIds((prev) => prev.filter((id) => id !== senderId));

      // notify other components (e.g., FriendRequests) that this request was processed
      try {
        window.dispatchEvent(
          new CustomEvent("friend-request-processed", {
            detail: { requestId, status: "accepted", senderId },
          })
        );
      } catch (e) {}
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRequest = async (requestId: string, senderId: number) => {
    if (!token) return;
    try {
      await friendsApi.post(
        "/friends/reject",
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReceivedIds((prev) => prev.filter((id) => id !== senderId));

      try {
        window.dispatchEvent(
          new CustomEvent("friend-request-processed", {
            detail: { requestId, status: "rejected", senderId },
          })
        );
      } catch (e) {}
    } catch (err) {
      console.error(err);
    }
  };

  // listen for processed request events from other components and update local state
  useEffect(() => {
    const handler = (e: any) => {
      const { status, senderId, requestId } = e?.detail || {};
      if (!senderId) return;
      if (status === "accepted") {
        setFriends((prev) => (prev.includes(Number(senderId)) ? prev : [...prev, Number(senderId)]));
        setReceivedIds((prev) => prev.filter((id) => id !== Number(senderId)));
        setRequestedIds((prev) => prev.filter((id) => id !== Number(senderId)));
      } else if (status === "rejected") {
        setReceivedIds((prev) => prev.filter((id) => id !== Number(senderId)));
      }
      // also remove mapping entry if present
      setReceivedMap((prev) => {
        const copy = { ...prev };
        if (requestId) {
          const key = Number(senderId);
          if (copy[key] === requestId) delete copy[key];
        }
        return copy;
      });
    };

    window.addEventListener("friend-request-processed", handler as EventListener);
    return () => window.removeEventListener("friend-request-processed", handler as EventListener);
  }, []);

  useEffect(() => {
    if (!token) return;

    friendsApi
      .get("/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const friendIds = res.data.map((f: any) => Number(f.friendId));
        setFriends(friendIds);

        // 🔥 remove requested if already friends
        setRequestedIds((prev) => prev.filter((id) => !friendIds.includes(id)));
      });

  }, [token]);

  useEffect(() => {
    console.table(users);
  }, [users]);

  const unfriend = async (friendId: number) => {
    await friendsApi.post(
      "/friends/unfriend",
      { friendId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setFriends((prev) => prev.filter((id) => id !== friendId));
    setRequestedIds((prev) => prev.filter((id) => id !== friendId));
  };




  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Find Your Buddies</h1>

        <div className="w-full max-w-xs">
          <input
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or username"
            className="w-full px-3 py-2 rounded border bg-white/5 placeholder:text-zinc-400"
          />
        </div>
      </div>

      <FriendRequests defaultOpen={openRequestsFromQuery} />

      {useMemo(() => users.filter((user) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const name = (user.fullName || "").toLowerCase();
        const username = (user.username || "").toLowerCase();
        return name.includes(q) || username.includes(q);
      }), [users, search]).length === 0 && (
        <p className="text-gray-500">No users found</p>
      )}

      {useMemo(() => users.filter((user) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const name = (user.fullName || "").toLowerCase();
        const username = (user.username || "").toLowerCase();
        return name.includes(q) || username.includes(q);
      }), [users, search]).map((user) => (
        <div
          key={user.djangoUserId}
          className="flex justify-between items-center border p-3 rounded"
        >
          <div
            onClick={() => setSelectedUser(user)}
            className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900 
             hover:bg-zinc-800 transition cursor-pointer"
          >
            <img
              src={
                (function (raw?: any) {
                  const avatar = raw?.avatar ?? raw?.profile_image ?? raw?.profileImage;
                  if (!avatar) return "/avatar.png";
                  if (avatar.startsWith("http")) return avatar;
                  if (avatar.startsWith("/")) return `${BACKEND_BASE}${avatar}`;
                  return `${BACKEND_BASE}/${avatar}`;
                })(user)
              }
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith("/avatar.png")) img.src = "/avatar.png";
              }}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold group-hover:text-indigo-400 transition">
                {user.fullName}
              </p>
              <p className="text-sm text-zinc-400">@{user.username}</p>
            </div>
          </div>

          {friends.includes(user.djangoUserId) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">Friends</Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => unfriend(user.djangoUserId)}
                >
                  Unfriend
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : receivedIds.includes(user.djangoUserId) ? (
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  acceptRequest(receivedMap[user.djangoUserId], user.djangoUserId)
                }
              >
                Accept
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  rejectRequest(receivedMap[user.djangoUserId], user.djangoUserId)
                }
              >
                Reject
              </Button>
            </div>
          ) : requestedIds.includes(user.djangoUserId) ? (
            <Button disabled>Requested</Button>
          ) : (
            <Button onClick={() => sendRequest(user.djangoUserId)}>
              Send Request
            </Button>
          )}
        </div>
      ))}
      <BuddyProfileModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onRequestSent={(receiverId: number) =>
          setRequestedIds((prev) => (prev.includes(receiverId) ? prev : [...prev, receiverId]))
        }
        isIncoming={selectedUser ? receivedIds.includes(selectedUser.djangoUserId) : false}
        requestId={selectedUser ? receivedMap[selectedUser.djangoUserId] : undefined}
        isRequested={selectedUser ? requestedIds.includes(selectedUser.djangoUserId) : false}
        isFriend={selectedUser ? friends.includes(selectedUser.djangoUserId) : false}
        onAccept={(requestId: string, senderId: number) => acceptRequest(requestId, senderId)}
        onReject={(requestId: string, senderId: number) => rejectRequest(requestId, senderId)}
      />
    </div>
  );
}
