import { useState } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface InviteUserDialogProps {
  workspaceId: number;
  workspaceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteUserDialog({
  workspaceId,
  workspaceName,
  open,
  onOpenChange,
  onSuccess,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const inviteUser = api.workspace.inviteUser.useMutation({
    onSuccess: () => {
      setEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      setInviteError(error.message);
      setTimeout(() => setInviteError(""), 5000);
    },
  });

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviteError("");
    try {
      await inviteUser.mutateAsync({
        workspaceId,
        email: email.trim(),
      });
    } catch (error) {
      // Error handled in onError
    }
  };

  const handleClose = () => {
    setEmail("");
    setInviteError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite User to {workspaceName}</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate in this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              onKeyDown={(e) => {
                if (e.key === "Enter" && email.trim()) {
                  void handleInvite();
                }
              }}
            />
            {inviteError && (
              <p className="text-sm text-red-600">{inviteError}</p>
            )}
            {inviteSuccess && (
              <p className="text-sm text-green-600">Invitation sent successfully!</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleInvite()}
            disabled={inviteUser.status === "pending" || !email.trim()}
          >
            {inviteUser.status === "pending" ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 