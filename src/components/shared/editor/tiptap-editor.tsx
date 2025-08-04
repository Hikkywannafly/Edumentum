"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ChevronDown,
  Italic,
  LinkIcon,
  MoreHorizontal,
  Type,
  Underline,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder,
  className,
  showToolbar = true,
}: TiptapEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      setIsFocused(true);
    },
    onBlur: () => {
      // Delay hiding toolbar to allow clicking on toolbar buttons
      setTimeout(() => setIsFocused(false), 200);
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none p-3 min-h-[40px] transition-all duration-200 ${
          isFocused ? "ring-2 ring-blue-500" : ""
        } ${className || ""}`,
        "data-placeholder": placeholder || "",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, {
        parseOptions: { preserveWhitespace: "full" },
      });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-md border bg-white transition-colors hover:border-gray-400">
        <EditorContent editor={editor} />
      </div>

      {/* Floating Toolbar */}
      {showToolbar && isFocused && (
        <div className="-mt-12 slide-in-from-top-2 absolute top-0 right-0 left-0 z-10 animate-in rounded-md border border-gray-200 bg-white p-2 shadow-lg duration-200">
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Type className="mr-1 h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().setParagraph().run()}
                >
                  Normal
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                >
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                >
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                >
                  Heading 3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${editor.isActive("strike") ? "bg-gray-200" : ""}`}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Underline className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
              onClick={addLink}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  Bullet List
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  Numbered List
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                >
                  Quote
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  Horizontal Rule
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().undo().run()}
                >
                  Undo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().redo().run()}
                >
                  Redo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
}
