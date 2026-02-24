import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import api from "../api/axios";
import friendsApi from "../api/friends";
import { BACKEND_BASE } from "../api/config";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";

import logo from "/favicon.jpg";

type NotificationItem = {
  id: string;
  text: string;
  href: string;
  type: "request" | "pending" | "reminder" | "activity";
};

const NOTIFICATION_SEEN_KEY = "nav_notifications_seen";
const NOTIFICATION_ACTIONS_KEY = "nav_notifications_actions";

function normalizeProfile(raw: any) {
  const firstName = raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.last_name ?? raw.lastName ?? "";
  const bio = raw.bio ?? "";
  const occupation = raw.occupation ?? "";
  let profileImage = raw.profile_image ?? raw.profileImage ?? "";

  if (profileImage && !profileImage.startsWith("http")) {
    if (profileImage.startsWith("/")) profileImage = `${BACKEND_BASE}${profileImage}`;
    else profileImage = `${BACKEND_BASE}/${profileImage}`;
  }

  if (!profileImage) profileImage = "/default-profile.png";

  return { firstName, lastName, bio, occupation, profileImage };
}

const CustomNavbar = ({
  onLoginChange,
}: {
  onLoginChange?: (value: boolean) => void;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [incomingNotifications, setIncomingNotifications] = useState<NotificationItem[]>([]);
  const [reminderNotifications, setReminderNotifications] = useState<NotificationItem[]>([]);
  const [activityNotifications, setActivityNotifications] = useState<NotificationItem[]>([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const rawSeen = localStorage.getItem(NOTIFICATION_SEEN_KEY);
      const rawActions = localStorage.getItem(NOTIFICATION_ACTIONS_KEY);
      if (rawSeen) setSeenNotificationIds(JSON.parse(rawSeen));
      if (rawActions) setActivityNotifications(JSON.parse(rawActions));
    } catch {
      // ignore invalid localStorage data
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      const cached = localStorage.getItem("userProfile");
      setUserProfile(cached ? JSON.parse(cached) : null);
      const logged = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(logged);
      onLoginChange?.(logged);
      return;
    }

    api
      .get("/profile/")
      .then((res) => {
        const normalized = normalizeProfile(res.data);
        setUserProfile(normalized);
        setIsLoggedIn(true);
        onLoginChange?.(true);
        localStorage.setItem("userProfile", JSON.stringify(normalized));
        localStorage.setItem("isLoggedIn", "true");
      })
      .catch((err) => {
        console.error("Profile fetch failed:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userProfile");
        localStorage.setItem("isLoggedIn", "false");
        setUserProfile(null);
        setIsLoggedIn(false);
        onLoginChange?.(false);
      });
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      const profile = localStorage.getItem("userProfile");
      setUserProfile(profile ? JSON.parse(profile) : null);
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };
    window.addEventListener("storage", syncProfile);
    return () => window.removeEventListener("storage", syncProfile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userProfile");
    localStorage.setItem("isLoggedIn", "false");
    setUserProfile(null);
    setIsLoggedIn(false);
    setDropdownOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
    onLoginChange?.(false);
  };

  const notifications = useMemo(() => {
    const merged = [
      ...incomingNotifications,
      ...reminderNotifications,
      ...activityNotifications,
    ];
    const map = new Map<string, NotificationItem>();
    merged.forEach((n) => {
      if (!map.has(n.id)) map.set(n.id, n);
    });
    return Array.from(map.values());
  }, [incomingNotifications, reminderNotifications, activityNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !seenNotificationIds.includes(n.id)).length,
    [notifications, seenNotificationIds]
  );

  useEffect(() => {
    if (!notifOpen || notifications.length === 0) return;
    const seen = new Set(seenNotificationIds);
    let changed = false;
    for (const n of notifications) {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        changed = true;
      }
    }
    if (!changed) return;
    const next = Array.from(seen);
    setSeenNotificationIds(next);
    localStorage.setItem(NOTIFICATION_SEEN_KEY, JSON.stringify(next));
  }, [notifOpen, notifications, seenNotificationIds]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !isLoggedIn) {
      setIncomingNotifications([]);
      setReminderNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const [receivedRes, sentRes, usersRes, summaryRes] = await Promise.all([
          friendsApi.get("/friends/received", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          friendsApi.get("/friends/sent", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          friendsApi.get("/users/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/skills/courses/dashboard-summary/"),
        ]);

        const userMap: Record<string, any> = {};
        (usersRes.data || []).forEach((u: any) => {
          const key = String(u.djangoUserId ?? u.userId ?? u.id);
          userMap[key] = u;
        });
        const resolveName = (uid: string | number): string => {
          const u = userMap[String(uid)];
          if (!u) return "Someone";
          return u.fullName || u.username || u.email || "Someone";
        };

        const received = (receivedRes.data || []).map((req: any) => ({
          id: `req-incoming-${req.id}`,
          text: `${resolveName(req.senderId)} sent you a friend request`,
          href: "/buddy-finder?requests=open",
          type: "request" as const,
        }));

        const pending = (sentRes.data || []).map((req: any) => ({
          id: `req-pending-${req.id}`,
          text: `Friend request pending: ${resolveName(req.receiverId)}`,
          href: "/buddy-finder?requests=open",
          type: "pending" as const,
        }));

        const summary = summaryRes?.data?.summary || {};
        const reminders: NotificationItem[] = [];
        if (summary.active_skills > 0 && summary.weekly_sessions === 0) {
          reminders.push({
            id: "reminder-weekly-practice",
            text: "Reminder: complete a stage today to start this week's progress.",
            href: "/dashboard",
            type: "reminder",
          });
        }
        if (summary.active_skills > 0 && summary.streak_days === 0) {
          reminders.push({
            id: "reminder-streak",
            text: "Reminder: finish one stage today to build your streak.",
            href: "/dashboard",
            type: "reminder",
          });
        }
        if (summary.active_skills === 0) {
          reminders.push({
            id: "reminder-start-skill",
            text: "Reminder: start a skill to unlock personalized progress tracking.",
            href: "/skills",
            type: "reminder",
          });
        }

        setIncomingNotifications([...received, ...pending]);
        setReminderNotifications(reminders);
      } catch {
        // keep navbar stable if notifications fail
      }
    };

    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, [isLoggedIn]);

  useEffect(() => {
    const onRequestProcessed = (evt: Event) => {
      const customEvt = evt as CustomEvent<{
        requestId?: string;
        status?: "accepted" | "rejected";
      }>;
      const requestId = customEvt?.detail?.requestId;
      const status = customEvt?.detail?.status;
      if (!requestId || !status) return;

      const item: NotificationItem = {
        id: `req-activity-${requestId}-${status}`,
        text:
          status === "accepted"
            ? "You accepted a friend request."
            : "You rejected a friend request.",
        href: "/buddy-finder?requests=open",
        type: "activity",
      };

      setActivityNotifications((prev) => {
        const next = [item, ...prev].slice(0, 20);
        localStorage.setItem(NOTIFICATION_ACTIONS_KEY, JSON.stringify(next));
        return next;
      });
    };

    window.addEventListener("friend-request-processed", onRequestProcessed as EventListener);
    return () =>
      window.removeEventListener(
        "friend-request-processed",
        onRequestProcessed as EventListener
      );
  }, []);

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center space-x-3 group min-w-0"
            onClick={() => {
              setMobileMenuOpen(false);
              setNotifOpen(false);
              setDropdownOpen(false);
            }}
          >
            <div className="text-2xl transition-transform group-hover:scale-110 shrink-0">
              <img src={logo} className="w-8" />
            </div>
            <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              LearnoWay
            </h1>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/skills">
              <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                Browse Skills
              </Button>
            </Link>

            <Link to="/buddy-finder">
              <Button variant="ghost" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                Buddy Finder
              </Button>
            </Link>

            {isLoggedIn ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  onClick={() => {
                    setNotifOpen((v) => !v);
                    setDropdownOpen(false);
                  }}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </p>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={n.href}
                            onClick={() => setNotifOpen(false)}
                            className={`block px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                              seenNotificationIds.includes(n.id)
                                ? "text-gray-600 dark:text-gray-300"
                                : "text-gray-900 dark:text-white font-medium"
                            }`}
                          >
                            {n.text}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {isLoggedIn && userProfile ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 rounded-full bg-white/80 dark:bg-gray-800/80 px-3 py-2 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
                    {userProfile.profileImage ? (
                      <AvatarImage src={userProfile.profileImage} />
                    ) : (
                      <AvatarFallback>{userProfile.firstName?.[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>

                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile.firstName} {userProfile.lastName}
                  </span>
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      to="/profile-setup"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Edit/Setup Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>

                    <button
                      className="text-red-500 w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowDelete(true);
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center font-semibold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </p>
                    </div>
                    <div className="max-h-72 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={n.href}
                            onClick={() => setNotifOpen(false)}
                            className={`block px-4 py-3 text-sm border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                              seenNotificationIds.includes(n.id)
                                ? "text-gray-600 dark:text-gray-300"
                                : "text-gray-900 dark:text-white font-medium"
                            }`}
                          >
                            {n.text}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-3 space-y-2">
            <Link to="/skills" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Browse Skills
              </Button>
            </Link>

            <Link to="/buddy-finder" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Buddy Finder
              </Button>
            </Link>

            {isLoggedIn && userProfile ? (
              <>
                <div className="flex items-center gap-3 px-1 py-2">
                  <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
                    {userProfile.profileImage ? (
                      <AvatarImage src={userProfile.profileImage} />
                    ) : (
                      <AvatarFallback>{userProfile.firstName?.[0] ?? "U"}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {userProfile.firstName} {userProfile.lastName}
                  </span>
                </div>

                <Link to="/profile-setup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Edit/Setup Profile
                  </Button>
                </Link>

                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  Logout
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowDelete(true);
                  }}
                >
                  Delete Account
                </Button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteAccountDialog open={showDelete} onOpenChange={setShowDelete} />
    </nav>
  );
};

export default CustomNavbar;
