import { useState, useEffect } from "react";
import { BACKEND_BASE } from "../api/config";
import friendsApi from "../api/friends";

export default function BuddyProfileModal({ user, onClose, onRequestSent, isIncoming, requestId, onAccept, onReject, isRequested, isFriend }: any) {
  if (!user) return null;

  const [loading, setLoading] = useState(false);
  // requested is derived from parent but we keep a local optimistic flag that syncs with prop
  const [requested, setRequested] = useState<boolean>(Boolean(isRequested));

  // sync local optimistic state when parent updates
  useEffect(() => {
    setRequested(Boolean(isRequested));
  }, [isRequested]);

  const sendRequest = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("You must be logged in to send requests");

    setLoading(true);
    try {
      const receiverId = user.djangoUserId ?? user.userId ?? user.id;
      await friendsApi.post(
        "/friends/request",
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // optimistic local update; parent should also update via onRequestSent or event
      setRequested(true);
      // notify others (parent can listen if needed)
      window.dispatchEvent(new CustomEvent("friend-request-sent", { detail: { receiverId } }));
      // call parent callback if provided
      if (typeof onRequestSent === 'function') {
        try {
          onRequestSent(receiverId);
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      console.error("Send friend request failed", err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Could not send friend request";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-6 w-[380px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center gap-3">
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
            className="w-20 h-20 rounded-full object-cover"
          />

          <h2 className="text-xl font-semibold">{user.fullName}</h2>
          <p className="text-zinc-400">@{user.username}</p>
          <p className="text-sm text-zinc-500">{user.email}</p>

          {isIncoming ? (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => onAccept && onAccept(requestId, user.djangoUserId ?? user.userId ?? user.id)}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500"
              >
                Accept
              </button>
              <button
                onClick={() => onReject && onReject(requestId, user.djangoUserId ?? user.userId ?? user.id)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                Reject
              </button>
            </div>
          ) : (
            // If already friends, show disabled friends state; if requested, show Requested; otherwise allow send
            isFriend ? (
              <button disabled className="mt-4 px-4 py-2 rounded-lg bg-secondary-600">Friends</button>
            ) : (
              <button
                onClick={sendRequest}
                disabled={loading || requested}
                className={`mt-4 px-4 py-2 rounded-lg ${requested ? 'bg-gray-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
              >
                {loading ? 'Sending...' : requested ? 'Requested' : 'Send Friend Request'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
