"use client";
import React, { Dispatch, SetStateAction } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

export default function TextEditor({
  onEditContent,
  content,
}: {
  onEditContent: Dispatch<SetStateAction<string>>;
  content: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    onUpdate: ({ editor }) => {
      onEditContent(editor.getHTML());
    },
  });

  // Render placeholder if editor is not ready
  if (!editor) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-2 relative">
        <div className="border rounded-t p-2 min-h-[200px] overflow-y-auto">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto space-y-2 relative">
      <div className="border rounded-t p-2">
        <EditorContent
          editor={editor}
          className="prose w-full max-h-[280px] overflow-y-auto 
            [&>.ProseMirror]:outline-none [&>.ProseMirror]:min-h-[180px] [&>.ProseMirror]:cursor-text"
          placeholder="Start typing here..."
          value={"Hello"}
        />
      </div>
      <div className="border-t bg-white p-1 rounded-b flex items-center gap-0.5  bottom-2 left-2">
        {/* Text Formatting Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 ${editor.isActive("bold") ? "bg-muted" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 ${editor.isActive("italic") ? "bg-muted" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 ${editor.isActive("underline") ? "bg-muted" : ""}`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 ${editor.isActive("strike") ? "bg-muted" : ""}`}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo/Redo Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />
      </div>
    </div>
  );
}
