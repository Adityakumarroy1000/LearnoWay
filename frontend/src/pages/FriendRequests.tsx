import { useEffect, useState } from "react";
import friendsApi from "../api/friends";
import BuddyProfileModal from "./BuddyProfileModal";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { BACKEND_BASE } from "../api/config";

interface Request {
  id: string;
  senderId: number;
  receiverId: number;
  status: string;
}

type FriendRequestsProps = {
  defaultOpen?: boolean;
};

export default function FriendRequests({ defaultOpen = false }: FriendRequestsProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, any>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [processedIds, setProcessedIds] = useState<Record<string, 'accepted' | 'rejected'>>({});
  const token = localStorage.getItem("accessToken");

  // 🔹 Fetch received requests
  useEffect(() => {
    if (!token) return;

    friendsApi
      .get("/friends/received", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRequests(res.data))
      .catch(console.error);
  }, [token]);

  // 🔹 Fetch users from friend-service
  useEffect(() => {
    if (!token) return;

    friendsApi
      .get("/users/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const map: any = {};
        res.data.forEach((u: any) => {
          const key = u.djangoUserId ?? u.userId ?? u.id;
          map[key] = u;
        });
        setUsersMap(map);
      })
      .catch(console.error);
  }, [token]);

  const setLoading = (id: string, v: boolean) => {
    setLoadingIds((prev) => {
      const copy = new Set(prev);
      if (v) copy.add(id); else copy.delete(id);
      return copy;
    });
  };

  const accept = async (id: string) => {
    if (!token) return;
    setLoading(id, true);
    try {
      await friendsApi.post(
        "/friends/accept",
        { requestId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // mark locally
      setProcessedIds((p) => ({ ...p, [id]: 'accepted' }));
      // capture senderId before removing so we can notify other components
      const req = requests.find((r) => r.id === id);
      const senderId = req?.senderId;
      setRequests((prev) => prev.filter((r) => r.id !== id));

      // notify other parts of the app (e.g., BuddyFinder) so they can update their state
      try {
        window.dispatchEvent(
          new CustomEvent("friend-request-processed", {
            detail: { requestId: id, status: "accepted", senderId },
          })
        );
      } catch (e) {
        // ignore if CustomEvent not supported in some env
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Could not accept request';
      alert(msg);
    } finally {
      setLoading(id, false);
    }
  };

  const reject = async (id: string) => {
    if (!token) return;
    setLoading(id, true);
    try {
      await friendsApi.post(
        "/friends/reject",
        { requestId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProcessedIds((p) => ({ ...p, [id]: 'rejected' }));
      const req = requests.find((r) => r.id === id);
      const senderId = req?.senderId;
      setRequests((prev) => prev.filter((r) => r.id !== id));

      try {
        window.dispatchEvent(
          new CustomEvent("friend-request-processed", {
            detail: { requestId: id, status: "rejected", senderId },
          })
        );
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Could not reject request';
      alert(msg);
    } finally {
      setLoading(id, false);
    }
  };

  useEffect(() => {
    if (defaultOpen) setIsOpen(true);
  }, [defaultOpen]);

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-4 border border-gray-200/20 dark:border-gray-700/20 rounded-lg p-2 bg-white/3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen((v) => !v)}
          role="button"
          aria-expanded={isOpen}
        >
          <h2 className="text-xl font-semibold">Buddy Requests</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-500">{requests.length} pending</div>
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {isOpen && (
          <>
            {requests.length === 0 && (
              <p className="text-gray-500">No pending requests</p>
            )}

                {requests.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center p-3 rounded bg-white/5"
              >
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
              const u = usersMap[r.senderId];
              if (u) setSelectedUser(u);
            }}>
              <img
                src={
                  (function () {
                    const raw = usersMap[r.senderId];
                    const avatar = raw?.avatar ?? raw?.profile_image ?? raw?.profileImage;
                    if (!avatar) return "/avatar.png";
                    if (avatar.startsWith("http")) return avatar;
                    if (avatar.startsWith("/")) return `${BACKEND_BASE}${avatar}`;
                    return `${BACKEND_BASE}/${avatar}`;
                  })()
                }
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.endsWith("/avatar.png")) img.src = "/avatar.png";
                }}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">{usersMap[r.senderId]?.fullName || usersMap[r.senderId]?.email || 'Unknown'}</div>
                <div className="text-sm text-zinc-400">@{usersMap[r.senderId]?.username}</div>
              </div>
            </div>

            <div className="space-x-2 flex items-center">
              {processedIds[r.id] ? (
                <div className={`px-3 py-1 rounded ${processedIds[r.id] === 'accepted' ? 'bg-green-600' : 'bg-red-600'} text-white`}>{processedIds[r.id] === 'accepted' ? 'Accepted' : 'Rejected'}</div>
              ) : (
                <>
                  <Button onClick={() => accept(r.id)} disabled={loadingIds.has(r.id)}>
                    <Check className="mr-2 h-4 w-4" /> Accept
                  </Button>
                  <Button variant="destructive" onClick={() => reject(r.id)} disabled={loadingIds.has(r.id)}>
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
            </div>
          </div>
            ))}
          </>
        )}

        {selectedUser && (
          <BuddyProfileModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            isIncoming={true}
            requestId={undefined}
            onAccept={(requestId: string) => {
              // accept by finding request for this user
              const req = requests.find((r) => r.senderId === (selectedUser.djangoUserId ?? selectedUser.userId ?? selectedUser.id));
              if (req) accept(req.id);
            }}
            onReject={(requestId: string) => {
              const req = requests.find((r) => r.senderId === (selectedUser.djangoUserId ?? selectedUser.userId ?? selectedUser.id));
              if (req) reject(req.id);
            }}
            isRequested={false}
            isFriend={false}
          />
        )}
    </div>
  );
}
