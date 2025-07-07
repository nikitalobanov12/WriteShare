"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useDebounce } from "~/hooks/use-debounce";

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

  // Initialize state when page data loads
  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setEmoji(page.emoji ?? "");
      setContent(page.content ?? "");
    }
  }, [page]);

  // Auto-save when content changes
  useEffect(() => {
    if (!page) return;

    const hasChanges =
      debouncedTitle !== page.title ||
      debouncedEmoji !== page.emoji ||
      debouncedContent !== page.content;

    if (hasChanges && (debouncedTitle || debouncedContent || debouncedEmoji)) {
      updatePageMutation.mutate({
        id: pageIdString,
        title: debouncedTitle ?? "Untitled",
        emoji: debouncedEmoji,
        content: debouncedContent,
      });
    }
  }, [
    debouncedTitle,
    debouncedEmoji,
    debouncedContent,
    page,
    pageIdString,
    updatePageMutation,
  ]);

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
      <div className="min-h-screen bg-white">
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Page not found</h2>
          <p className="mb-4 text-gray-600">
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

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workspace
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
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
                className="h-12 w-16 border-none p-0 text-center text-2xl shadow-none focus:ring-0"
                maxLength={2}
              />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                placeholder="Untitled"
                className="h-12 border-none p-0 text-4xl font-bold shadow-none placeholder:text-gray-400 focus:ring-0"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your page content here... You can use Markdown formatting!"
              className="min-h-[600px] w-full resize-none rounded-lg border p-4 font-mono text-base leading-relaxed placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            />
            <p className="text-xs text-gray-500">
              💡 Tip: This editor supports Markdown formatting. Use **bold**,
              *italic*, `code`, and more!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
