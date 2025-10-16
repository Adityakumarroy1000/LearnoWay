import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center focus:outline-none"
      >
        <img
          src={user?.avatar || "/default-avatar.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full border"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
          <Link
            to="/profile"
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Edit / Setup Profile
          </Link>
          <Link
            to="/dashboard"
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
