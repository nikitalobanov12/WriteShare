"use client";

import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { api} from "~/trpc/react";


export default function SettingsPage() {
  const { data: user, isLoading, error } = api.user.getCurrent.useQuery();
  const utils = api.useUtils();
  const [success, setSuccess] = useState(false);
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      void utils.user.getCurrent.invalidate();
      setSuccess(true);
    },
  });
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  // Type guard for user
  function isUser(u: unknown): u is { name?: string | null; image?: string | null } {
    return (
      typeof u === "object" &&
      u !== null &&
      ("name" in u || "image" in u)
    );
  }

  // Initialize form fields when user data loads
  useEffect(() => {
    if (isUser(user)) {
      setName(user.name ?? "");
      setImage(user.image ?? "");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Card className="w-full max-w-xl p-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="text-muted-foreground text-sm mt-4">Loading...</div>
        </Card>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Card className="w-full max-w-xl p-6 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <div className="text-destructive text-sm mt-4">Failed to load user settings.</div>
        </Card>
      </div>
    );
  }

  // Type guard for updateProfile.error
  function isError(e: unknown): e is { message?: string } {
    return typeof e === "object" && e !== null && "message" in e;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <Card className="w-full max-w-xl p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSuccess(false);
            updateProfile.mutate({ name, image: image ?? undefined });
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="font-medium">Name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
              placeholder="Your name"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">Profile Image URL</span>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </label>
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {isError(updateProfile.error) && (
            <div className="text-destructive text-sm">
              {updateProfile.error?.message ?? "Failed to update profile."}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-sm">Profile updated!</div>
          )}
        </form>
      </Card>
    </div>
  );
} 