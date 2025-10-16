import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OtpVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromSignup = location.state?.email || "";

  const [email, setEmail] = useState(emailFromSignup);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Account verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data.error || "❌ Invalid OTP");
      }
    } catch (error) {
      setMessage("⚠️ Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex justify-center items-center  bg-gray-100 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <form
        onSubmit={handleVerify}
        className="p-6 bg-white rounded shadow-md w-96 text-black bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl border border-gray-200/50 dark:border-gray-600/50 "
      >
        <h2 className="text-xl font-bold mb-4 dark:text-stone-300">
          Verify OTP
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
          hidden
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          Verify
        </button>

        {message && (
          <p className="mt-3 text-center text-sm text-red-500">{message}</p>
        )}
      </form>
    </div>
  );
};

export default OtpVerify;
