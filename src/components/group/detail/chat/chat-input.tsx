"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim() || disabled) return;
    onSend(inputMessage.trim());
    setInputMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2 border-t bg-white p-2"
    >
      <Input
        type="text"
        placeholder="Nhập tin nhắn..."
        className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
      />
      <Button
        type="submit"
        size="icon"
        className="h-10 w-10 rounded-full"
        disabled={disabled || !inputMessage.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
