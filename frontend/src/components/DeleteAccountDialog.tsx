import { useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import api from "@/api/axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ApiErrorPayload = {
  error?: string;
  detail?: string;
};

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

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

export default function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<"warning" | "reauth">("warning");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [googleIdToken, setGoogleIdToken] = useState<string>("");
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const getApiMessage = (err: unknown, fallback: string) => {
    const axiosErr = err as AxiosError<ApiErrorPayload>;
    return axiosErr?.response?.data?.error || axiosErr?.response?.data?.detail || fallback;
  };

  const handleUnauthorized = () => {
    setError("Session expired. Please log in again.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  const confirmDeleteWithGoogle = async () => {
    try {
      setError("");
      setNotice("");
      setLoading(true);
      await api.post("/confirm-delete-account/", { google_id_token: googleIdToken });
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorPayload>;
      if (axiosErr?.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getApiMessage(err, "Could not delete account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || step !== "reauth") return;
    if (!GOOGLE_CLIENT_ID) {
      setError("Google client ID missing. Contact support.");
      return;
    }
    if (!googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: GoogleCredentialResponse) => {
          const credential = response?.credential;
          if (!credential) {
            setError("Google re-auth failed. No credential returned.");
            return;
          }
          setGoogleIdToken(credential);
          setNotice("Google account verified. Click Confirm Delete to continue.");
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
      existingScript.addEventListener("load", renderGoogleButton, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.id = "google-identity-script";
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, [open, step]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setStep("warning");
          setGoogleIdToken("");
          setError("");
          setNotice("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Account</DialogTitle>
          <DialogDescription>
            {step === "warning"
              ? "This action is permanent and cannot be undone."
              : "Re-authenticate with Google, then confirm deletion."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>- Your account will be permanently deleted</p>
          <p>- All personal data will be erased</p>
          <p>- Images and files will be removed</p>
        </div>

        {step === "reauth" && (
          <div
            ref={googleButtonRef}
            className={`${loading ? "opacity-60 pointer-events-none" : ""} flex justify-center`}
          />
        )}

        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {step === "warning" ? (
            <Button
              variant="destructive"
              onClick={() => {
                setError("");
                setNotice("");
                setGoogleIdToken("");
                setStep("reauth");
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={() => void confirmDeleteWithGoogle()}
              disabled={!googleIdToken || loading}
            >
              Confirm Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
