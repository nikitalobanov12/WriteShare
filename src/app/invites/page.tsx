"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function InvitesPage() {
  const utils = api.useUtils();
  const { data: invites = [], isLoading, refetch } = api.workspace.getInvites.useQuery();
  const acceptInvite = api.workspace.acceptInvite.useMutation({
    onSuccess: async () => {
      await refetch();
      await utils.workspace.getWorkspaces.invalidate();
    },
  });
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Workspace Invites</h1>
      {isLoading ? (
        <div>Loading invites...</div>
      ) : invites.length === 0 ? (
        <div className="text-muted-foreground text-center py-12">
          <p>No pending workspace invites.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invites.map((invite) => (
            <Card key={invite.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{invite.workspace.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={invite.inviter.image ?? undefined} />
                    <AvatarFallback>
                      {invite.inviter.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Invited by {invite.inviter.name ?? invite.inviter.email}</div>
                    <div className="text-xs text-muted-foreground">{invite.inviter.email}</div>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    setAcceptingId(invite.id);
                    await acceptInvite.mutateAsync({ inviteId: invite.id });
                    setAcceptingId(null);
                  }}
                  disabled={acceptInvite.isPending && acceptingId === invite.id}
                >
                  {acceptInvite.isPending && acceptingId === invite.id ? "Accepting..." : "Accept"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 