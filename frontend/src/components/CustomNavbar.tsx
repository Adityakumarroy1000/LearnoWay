// src/pages/Index.tsx (replace your existing file)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { BACKEND_BASE } from "../api/config";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";


import logo from "/favicon.jpg";

function normalizeProfile(raw: any) {
  const firstName = raw.first_name ?? raw.firstName ?? "";
  const lastName = raw.last_name ?? raw.lastName ?? "";
  const bio = raw.bio ?? "";
  const occupation = raw.occupation ?? "";
  let profileImage = raw.profile_image ?? raw.profileImage ?? "";

  if (profileImage && !profileImage.startsWith("http")) {
    // profileImage could be "/media/..." or "media/..."
    if (profileImage.startsWith("/"))
      profileImage = `${BACKEND_BASE}${profileImage}`;
    else profileImage = `${BACKEND_BASE}/${profileImage}`;
  }

  if (!profileImage) profileImage = "/default-profile.png"; // your app-level fallback

  return { firstName, lastName, bio, occupation, profileImage };
}
const CustomNavbar = ({
  onLoginChange,
}: {
  onLoginChange?: (value: boolean) => void;
}) => {
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // welcome message
  useEffect(() => {
    api
      .get("/hello/")
      .then((r) => setMessage(r.data.message))
      .catch(() => {});
  }, []);

  // fetch profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // try local storage cache
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
        onLoginChange?.(true); // 🔹 Notify parent
        localStorage.setItem("userProfile", JSON.stringify(normalized));
        localStorage.setItem("isLoggedIn", "true");
      })
      .catch((err) => {
        console.error("Profile fetch failed:", err);
        // clear auth state on failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userProfile");
        localStorage.setItem("isLoggedIn", "false");
        setUserProfile(null);
        setIsLoggedIn(false);
        onLoginChange?.(false); // 🔹 Notify parent
      });
  }, []);

  // sync across tabs
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
    onLoginChange?.(false);
  };

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 group">
            <div className="text-2xl transition-transform group-hover:scale-110">
              <img src={logo} className="w-8" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {message || "SkillSprout"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/skills">
              <Button
                variant="ghost"
                className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Browse Skills
              </Button>
            </Link>

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
                      <AvatarFallback>
                        {userProfile.firstName?.[0] ?? "U"}
                      </AvatarFallback>
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
                    >
                      Edit/Setup Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
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
        </div>
      </div>
    </nav>
  );
};

export default CustomNavbar;
