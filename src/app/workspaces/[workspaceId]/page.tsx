"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const invite = api.workspace.inviteUser.useMutation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleInvite = async () => {
    try {
      await invite.mutateAsync({ workspaceId: Number(workspaceId), email });
      setMessage("Invite sent!");
      setEmail("");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage(JSON.stringify(e));
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Workspace ID: {workspaceId}</h1>
      <div className="flex items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User email to invite"
          className="flex-1 rounded border px-2 py-1"
        />
        <button
          onClick={handleInvite}
          disabled={invite.status === "pending"}
          className="ml-2 rounded bg-green-600 px-4 py-2 text-white"
        >
          Invite
        </button>
      </div>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
