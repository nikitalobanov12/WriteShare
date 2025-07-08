"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useDebounce } from "~/hooks/use-debounce";
import { Room } from "~/components/room";
import { CollaborativeEditor } from "~/components/collaborative-editor";

export default function PageDetailPage() {
  const { workspaceId, pageId } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounce the content to avoid too many API calls
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 500);
  const debouncedEmoji = useDebounce(emoji, 500);

  const pageIdString = String(pageId);

  // Fetch page data
  const {
    data: page,
    isLoading,
    error: fetchError,
  } = api.page.getPage.useQuery({ id: pageIdString }, { enabled: !!pageId });

  // Update page mutation
  const updatePageMutation = api.page.updatePage.useMutation({
    onSuccess: () => {
      setLastSaved(new Date());
    },
    onError: (err) => {
      console.error("Error saving page:", err);
    },
  });

  // Ref to track last saved values
  const lastSavedRef = useRef({
    title: "",
    emoji: "",
    content: "",
  });

  // Initialize state when page data loads
  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setEmoji(page.emoji ?? "");
      setContent(page.content ?? "");
      // Update lastSavedRef when page loads
      lastSavedRef.current = {
        title: page.title,
        emoji: page.emoji ?? "",
        content: page.content ?? "",
      };
    }
  }, [page]);

  // Auto-save when content changes, only if values differ from last saved
  useEffect(() => {
    if (!page) return;

    const current = {
      id: pageIdString,
      title: debouncedTitle ?? "Untitled",
      emoji: debouncedEmoji,
      content: debouncedContent,
    };

    const last = lastSavedRef.current;
    const hasChanges =
      current.title !== last.title ||
      current.emoji !== last.emoji ||
      current.content !== last.content;

    if (hasChanges && (current.title || current.content || current.emoji)) {
      updatePageMutation.mutate(current, {
        onSuccess: () => {
          setLastSaved(new Date());
          lastSavedRef.current = {
            title: current.title,
            emoji: current.emoji,
            content: current.content,
          };
        },
        onError: (err) => {
          console.error("Error saving page:", err);
        },
      });
    }
  }, [debouncedTitle, debouncedEmoji, debouncedContent, page, pageIdString, updatePageMutation]);

  const handleBack = () => {
    router.push(`/workspaces/${String(workspaceId)}`);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus on content area
      const contentArea = document.getElementById("content-editor");
      contentArea?.focus();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl p-6">
          <div className="mb-8 flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Page not found</h2>
          <p className="mb-4 text-gray-600 dark:text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workspace
          </Button>
        </div>
      </div>
    );
  }

  const roomId = `page-${pageIdString}`;

  return (
    <Room roomId={roomId}>
      <div className="min-h-screen bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Workspace
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
              {updatePageMutation.isPending && (
                <div className="flex items-center gap-1">
                  <Save className="h-3 w-3 animate-spin" />
                  Saving...
                </div>
              )}
              {lastSaved && !updatePageMutation.isPending && (
                <div className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="space-y-6">
            {/* Emoji and Title */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="📄"
                  className="h-12 w-16 border-none p-0 text-center text-2xl shadow-none focus:ring-0 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-400"
                  maxLength={2}
                />
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  placeholder="Untitled"
                  className="h-12 border-none p-0 text-4xl font-bold shadow-none placeholder:text-gray-400 dark:placeholder:text-zinc-400 focus:ring-0 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Collaborative Content Editor */}
            <div className="space-y-2">
              <CollaborativeEditor
                initialContent={content}
                placeholder="Start writing your page content here... You can format text, add lists, and collaborate in real-time!"
                onUpdate={(newContent) => {
                  setContent(newContent);
                }}
              />
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                💡 Tip: This is a collaborative editor. Multiple people can edit simultaneously!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Room>
  );
}
