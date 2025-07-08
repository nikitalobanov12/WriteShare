"use client";

import {
  useLiveblocksExtension,
  FloatingToolbar,
} from "@liveblocks/react-tiptap";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { useOthers } from "@liveblocks/react/suspense";
import { common, createLowlight } from "lowlight";
import { Skeleton } from "./ui/skeleton";
import { Threads } from "./threads";
import { EditorToolbar } from "./editor-toolbar";
import { useOnline } from "~/hooks/use-online";
import { Wifi, WifiOff } from "lucide-react";
import * as Y from "yjs";
import { useEffect, useRef } from "react";
import { throttle } from "lodash-es";

interface WindowWithApi extends Window {
  api?: {
    page?: {
      updatePageCrdt?: {
        mutate: (args: { id: string; crdtState: string }) => void;
      };
    };
  };
}

const lowlight = createLowlight(common);

interface CollaborativeEditorProps {
  initialContent?: string;
  placeholder?: string;
  crdtState?: string; // base64 string from backend
  pageId?: string;
}

export function CollaborativeEditor({
  initialContent = "",
  placeholder,
  crdtState,
  pageId,
}: CollaborativeEditorProps) {
  const others = useOthers();
  const liveblocks = useLiveblocksExtension();
  const isOnline = useOnline();

  // Yjs doc setup (lazy initialization)
  const ydocRef = useRef<Y.Doc | null>(null);
  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
    if (crdtState) {
      try {
        const update = Uint8Array.from(atob(crdtState), (c) => c.charCodeAt(0));
        Y.applyUpdate(ydocRef.current, update);
      } catch (e) {
        // ignore corrupt state
        console.error(e);
      }
    }
  }
  const ydoc = ydocRef.current;

  // TipTap editor
  const editor = useEditor({
    extensions: [
      liveblocks,
      StarterKit.configure({
        history: false,
        codeBlock: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-lg" },
      }),
      TaskList.configure({ HTMLAttributes: { class: "not-prose pl-2" } }),
      TaskItem.configure({
        HTMLAttributes: { class: "flex items-start my-4" },
        nested: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-4 max-w-none",
      },
    },
    immediatelyRender: false,
  });

  // Throttle save to backend
  useEffect(() => {
    if (!pageId || !ydoc) return;
    const save = throttle(
      (
        update: Uint8Array,
        _origin: unknown,
        _doc: Y.Doc,
        _transaction: Y.Transaction,
      ) => {
        const base64 = btoa(String.fromCharCode(...update));
        if (
          typeof window !== "undefined" &&
          (window as WindowWithApi).api?.page?.updatePageCrdt?.mutate &&
          pageId
        ) {
          const mutate = (window as WindowWithApi).api?.page?.updatePageCrdt
            ?.mutate;
          if (mutate) {
            mutate({ id: pageId, crdtState: base64 });
          }
        }
      },
      10000,
    );
    ydoc.on("update", save);
    return () => {
      ydoc.off("update", save);
    };
  }, [pageId, ydoc]);

  // Show loading skeleton while connecting
  if (!editor) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connection status and users indicator */}
      <div className="absolute -top-12 right-0 flex items-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
        {/* Online/Offline indicator */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-500">Offline</span>
            </>
          )}
        </div>

        {/* Connected users */}
        {others.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {others.slice(0, 3).map((other) => (
                <div
                  key={other.connectionId}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-medium text-white dark:border-zinc-800"
                  style={{ backgroundColor: other.info?.color || "#DC2626" }}
                  title={other.info?.name || "Anonymous"}
                >
                  {(other.info?.name || "A").charAt(0).toUpperCase()}
                </div>
              ))}
              {others.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-500 text-xs font-medium text-white dark:border-zinc-800">
                  +{others.length - 3}
                </div>
              )}
            </div>
            <span>
              {others.length} other{others.length !== 1 ? "s" : ""} editing
            </span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="min-h-[500px] rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <EditorToolbar editor={editor} />
        <EditorContent
          editor={editor}
          placeholder={placeholder}
        />
        <Threads editor={editor} />
        <FloatingToolbar editor={editor} />
      </div>
    </div>
  );
}
