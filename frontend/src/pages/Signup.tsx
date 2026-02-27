import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import friendsApi from "../api/friends";
import { normalizeProfile } from "@/utils/profile";
import { BACKEND_BASE, buildApiUrl } from "../api/config";

declare global {
  interface GoogleCredentialResponse {
    credential?: string;
  }

  interface GoogleIdAccounts {
    initialize: (config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme: "outline" | "filled_blue" | "filled_black";
        size: "large" | "medium" | "small";
        width?: number;
        text?: string;
      }
    ) => void;
  }

  interface GoogleIdentity {
    accounts: {
      id: GoogleIdAccounts;
    };
  }

  interface Window {
    google?: GoogleIdentity;
  }
}

type AuthPayload = {
  access: string;
  refresh: string;
  user_id: string | number;
  user?: {
    userId?: string | number;
    email?: string;
    username?: string;
  };
};

type GoogleSignupInitResponse = {
  needs_username?: boolean;
  suggested_username?: string;
  error?: string;
} & Partial<AuthPayload>;

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const GOOGLE_AUTH_URL = `${BACKEND_BASE}/api/google-login/`;

async function parseApiJson(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  if (contentType.includes("application/json")) {
    return JSON.parse(raw || "{}");
  }
  if (raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
    return JSON.parse(raw);
  }
  const summary = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
  throw new Error(summary || `Unexpected ${response.status} response`);
}

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [googleSuggestedUsername, setGoogleSuggestedUsername] = useState("");
  const [googleUsernameInput, setGoogleUsernameInput] = useState("");
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const finalizeLogin = useCallback(async (data: AuthPayload) => {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("userId", String(data.user_id));

    try {
      const [profileRes, accountRes] = await Promise.all([
        api.get("/profile/", {
          headers: { Authorization: `Bearer ${data.access}` },
        }),
        api.get("/get-profile/", {
          headers: { Authorization: `Bearer ${data.access}` },
        }),
      ]);

      const actualUsername =
        accountRes.data?.username ||
        profileRes.data?.username ||
        data.user?.username ||
        "";
      if (actualUsername) {
        localStorage.setItem("username", actualUsername);
      }

      const normalized = normalizeProfile(profileRes.data);
      localStorage.setItem("userProfile", JSON.stringify(normalized));
      localStorage.setItem("isLoggedIn", "true");
      window.dispatchEvent(new Event("storage"));

      const firstName = profileRes.data.first_name ?? profileRes.data.firstName ?? "";
      const lastName = profileRes.data.last_name ?? profileRes.data.lastName ?? "";
      let avatar = profileRes.data.profile_image ?? profileRes.data.profileImage ?? null;
      if (avatar && !avatar.startsWith("http")) {
        if (avatar.startsWith("/")) avatar = `${BACKEND_BASE}${avatar}`;
        else avatar = `${BACKEND_BASE}/${avatar}`;
      }
      const fullName = `${firstName} ${lastName}`.trim();

      const syncPayload = {
        userId: data.user?.userId ?? data.user_id ?? undefined,
        email: profileRes.data.email ?? data.user?.email ?? undefined,
        username: actualUsername || data.user?.username || undefined,
        fullName: fullName || undefined,
        avatar: avatar ?? undefined,
      };

      try {
        await friendsApi.post("/users/sync", syncPayload, {
          headers: { Authorization: `Bearer ${data.access}` },
        });
      } catch (err) {
        console.warn("Friend-service sync failed", err);
      }
    } catch (err) {
      console.warn("Could not fetch profile after signup", err);
    }
  }, []);

  const handleGoogleSignup = useCallback(async (idToken: string) => {
    setGoogleLoading(true);
    setMessage("");
    try {
      const firstRes = await fetch(GOOGLE_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });
      const firstData: GoogleSignupInitResponse = await parseApiJson(firstRes);

      const authData = firstData;
      if (firstData?.needs_username) {
        const suggested = firstData.suggested_username || "";
        setPendingGoogleToken(idToken);
        setGoogleSuggestedUsername(suggested);
        setGoogleUsernameInput(suggested);
        setUsernameModalOpen(true);
        return;
      } else if (!firstRes.ok) {
        throw new Error(firstData.error || "Google signup failed");
      }

      await finalizeLogin(authData as AuthPayload);
      navigate("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessage(`Google signup failed: ${errorMessage}`);
    } finally {
      setGoogleLoading(false);
    }
  }, [finalizeLogin, navigate]);

  const handleUsernameModalChange = useCallback((open: boolean) => {
    setUsernameModalOpen(open);
    if (!open) {
      setPendingGoogleToken(null);
      setGoogleSuggestedUsername("");
      setGoogleUsernameInput("");
    }
  }, []);

  const submitGoogleUsername = useCallback(async () => {
    const username = googleUsernameInput.trim();
    if (!pendingGoogleToken) {
      setMessage("Google signup session expired. Please try again.");
      setUsernameModalOpen(false);
      return;
    }
    if (!username) {
      setMessage("Username is required.");
      return;
    }

    setGoogleLoading(true);
    setMessage("");
    try {
      const secondRes = await fetch(GOOGLE_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: pendingGoogleToken, username }),
      });
      const authData: GoogleSignupInitResponse = await parseApiJson(secondRes);
      if (!secondRes.ok) {
        throw new Error(authData.error || "Google signup failed");
      }
      await finalizeLogin(authData as AuthPayload);
      setUsernameModalOpen(false);
      setPendingGoogleToken(null);
      setGoogleSuggestedUsername("");
      setGoogleUsernameInput("");
      navigate("/");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessage(`Google signup failed: ${errorMessage}`);
    } finally {
      setGoogleLoading(false);
    }
  }, [finalizeLogin, googleUsernameInput, navigate, pendingGoogleToken]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => {
          const credential = response?.credential;
          if (credential) {
            void handleGoogleSignup(credential);
          } else {
            setMessage("Google signup failed: no credential returned.");
          }
        },
      });
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const existingScript = document.getElementById("google-identity-script");
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-identity-script";
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, [handleGoogleSignup]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(buildApiUrl("/register/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created. Please verify OTP sent to your email.");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email: formData.email } });
        }, 1200);
      } else {
        setMessage(data.error || "Failed to create account");
      }

    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="text-3xl transition-transform group-hover:scale-110">
              ðŸŒ±
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LearnoWay
            </h1>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Create your account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Sign up with email or Google. Username is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="bg-white/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {message && (
                <p className="text-center text-sm font-medium text-red-500">
                  {message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading || googleLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>

              {GOOGLE_CLIENT_ID ? (
                <div className="pt-1">
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    or continue with
                  </div>
                  <div
                    ref={googleButtonRef}
                    className={`flex justify-center ${googleLoading ? "opacity-60 pointer-events-none" : ""}`}
                  />
                </div>
              ) : null}
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-blue-600 hover:text-purple-600 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={usernameModalOpen} onOpenChange={handleUsernameModalChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Username</DialogTitle>
            <DialogDescription>
              Complete Google signup by choosing a username.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={googleUsernameInput}
            placeholder={googleSuggestedUsername || "your_username"}
            onChange={(e) => setGoogleUsernameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void submitGoogleUsername();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleUsernameModalChange(false)}
              disabled={googleLoading}
            >
              Cancel
            </Button>
            <Button onClick={() => void submitGoogleUsername()} disabled={googleLoading}>
              {googleLoading ? "Saving..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
