import { useState } from "react";
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

  const sendOtp = async () => {
    try {
      setLoading(true);
      await api.post("/send-delete-otp/");
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.post("/confirm-delete-account/", { otp });

      localStorage.clear();
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <p>• Your account will be permanently deleted</p>
            <p>• All personal data will be erased</p>
            <p>• Images and files will be removed</p>
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
            placeholder="••••••"
          />
        )}

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          {step === "warning" ? (
            <Button variant="destructive" onClick={sendOtp} disabled={loading}>
              Continue
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={otp.length !== 6 || loading}
            >
              Delete Account
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
