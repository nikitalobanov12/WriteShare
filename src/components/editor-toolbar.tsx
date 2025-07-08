"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Table,
  Highlighter,
  Link,
  Image,
  CheckSquare,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700 p-2 flex flex-wrap items-center gap-1">
      {/* Text Formatting */}
      <Button
        variant={editor.isActive("bold") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("italic") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("strike") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("code") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("highlight") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Headings */}
      <Button
        variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <Button
        variant={editor.isActive("bulletList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("orderedList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <Button
        variant={editor.isActive("taskList") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <CheckSquare className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Block Elements */}
      <Button
        variant={editor.isActive("blockquote") ? "default" : "ghost"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Advanced Features */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        }}
      >
        <Table className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("Enter the URL");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
      >
        <Link className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const url = window.prompt("Enter the image URL");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
      >
        <Image   className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* History */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
} 