"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { FileText, Plus, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { InviteUserDialog } from "~/components/invite-user-dialog";

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageEmoji, setNewPageEmoji] = useState("📄");

  const workspaceIdNum = Number(workspaceId);

  // Get pages for this workspace
  const {
    data: pages,
    isLoading,
    refetch,
  } = api.page.getWorkspacePages.useQuery(
    { workspaceId: workspaceIdNum },
    { enabled: !!workspaceId },
  );

  // Create page mutation
  const createPageMutation = api.page.createPage.useMutation({
    onSuccess: (newPage) => {
      setIsCreateDialogOpen(false);
      setNewPageTitle("");
      setNewPageEmoji("📄");
      void refetch();
      // Navigate to the new page (we'll implement this route later)
      router.push(`/workspaces/${String(workspaceId)}/pages/${newPage.id}`);
    },
    onError: (error) => {
      console.error("Error creating page:", error);
    },
  });

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;

    await createPageMutation.mutateAsync({
      title: newPageTitle.trim(),
      workspaceId: workspaceIdNum,
      emoji: newPageEmoji,
    });
  };

  const handlePageClick = (pageId: string) => {
    router.push(`/workspaces/${String(workspaceId)}/pages/${pageId}`);
  };

  // TODO: Get workspace name from API if available. For now, use placeholder.
  const workspaceName = `Workspace #${workspaceIdNum}`;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workspace</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-32 animate-pulse">
              <CardContent className="p-4">
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-3 w-2/3 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workspace Pages</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <User className="mr-2 h-4 w-4" /> Invite users
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
                <DialogDescription>
                  Create a new page in this workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emoji">Emoji</Label>
                  <Input
                    id="emoji"
                    value={newPageEmoji}
                    onChange={(e) => setNewPageEmoji(e.target.value)}
                    placeholder="📄"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="Enter page title..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleCreatePage();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePage}
                    disabled={
                      !newPageTitle.trim() || createPageMutation.isPending
                    }
                  >
                    {createPageMutation.isPending ? "Creating..." : "Create Page"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <InviteUserDialog
        workspaceId={workspaceIdNum}
        workspaceName={workspaceName}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />

      {!pages || pages.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No pages yet
          </h3>
          <p className="mb-6 text-gray-500">
            Get started by creating your first page in this workspace.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Page
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card
              key={page.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => handlePageClick(page.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{page.emoji ?? "📄"}</span>
                  <span className="truncate">{page.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{page.author.name ?? page.author.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(page.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                {page.children && page.children.length > 0 && (
                  <div className="mt-3 text-sm text-gray-500">
                    {page.children.length} subpage
                    {page.children.length !== 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
