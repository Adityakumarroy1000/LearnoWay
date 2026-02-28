import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";

const COOLDOWN_MS = 5 * 60 * 1000;
const COOLDOWN_KEY = "deleteOtpCooldownUntil";

type ApiErrorPayload = {
  error?: string;
  detail?: string;
};

export default function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<"warning" | "otp">("warning");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<number>(() => {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const value = Number(raw || 0);
    return Number.isFinite(value) ? value : 0;
  });
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const cooldownSecondsLeft = useMemo(() => {
    return Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  }, [cooldownUntil, now]);

  const cooldownLabel = useMemo(() => {
    const mm = String(Math.floor(cooldownSecondsLeft / 60)).padStart(2, "0");
    const ss = String(cooldownSecondsLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [cooldownSecondsLeft]);

  const setCooldown = (durationMs: number) => {
    const until = Date.now() + durationMs;
    setCooldownUntil(until);
    localStorage.setItem(COOLDOWN_KEY, String(until));
  };

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

  const sendOtp = async () => {
    try {
      setError("");
      setNotice("");
      setLoading(true);

      if (cooldownSecondsLeft > 0) {
        setStep("otp");
        setNotice(`Please wait ${cooldownLabel} before requesting a new OTP.`);
        return;
      }

      await api.post("/send-delete-otp/");
      setStep("otp");
      setCooldown(COOLDOWN_MS);
      setNotice("OTP sent to your email.");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorPayload>;
      if (axiosErr?.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      if (axiosErr?.response?.status === 429) {
        setStep("otp");
        setCooldown(COOLDOWN_MS);
        setNotice(getApiMessage(err, "Please wait before requesting another OTP."));
        return;
      }
      setError(getApiMessage(err, "Failed to send OTP. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setError("");
      setNotice("");
      setLoading(true);
      await api.post("/confirm-delete-account/", { otp });
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorPayload>;
      if (axiosErr?.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setError(getApiMessage(err, "Could not delete account. Check OTP and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setStep("warning");
          setOtp("");
          setError("");
          setNotice("");
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            {step === "warning" ? "Delete Account" : "Confirm Deletion"}
          </DialogTitle>

          <DialogDescription>
            {step === "warning"
              ? "This action is permanent and cannot be undone."
              : "Enter the 6-digit OTP sent to your email."}
          </DialogDescription>
        </DialogHeader>

        {step === "warning" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>- Your account will be permanently deleted</p>
            <p>- All personal data will be erased</p>
            <p>- Images and files will be removed</p>
          </div>
        )}

        {step === "otp" && (
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="text-center tracking-widest"
            placeholder="......"
          />
        )}

        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {step === "warning" ? (
            <Button
              variant="destructive"
              onClick={sendOtp}
              disabled={loading || cooldownSecondsLeft > 0}
            >
              {cooldownSecondsLeft > 0 ? `Resend in ${cooldownLabel}` : "Continue"}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={sendOtp}
                disabled={loading || cooldownSecondsLeft > 0}
              >
                {cooldownSecondsLeft > 0 ? `Resend in ${cooldownLabel}` : "Resend OTP"}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={otp.length !== 6 || loading}
              >
                Delete Account
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
