"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { useAuth } from "../../../../contexts/auth-context";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-message";

interface ChatProps {
  setClose: () => void;
  roomId: string;
  currentUserId: number;
  currentUserName?: string;
  currentUserAvatar?: string;
}

interface Message {
  roomId: number;
  senderId: number;
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

export default function Chat({
  setClose,
  roomId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const { accessToken } = useAuth();

  // Load lịch sử tin nhắn
  const fetchHistory = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(
        `https://edumentumbackend-production.up.railway.app/api/v1/chat/groups/${roomId}/messages`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!res.ok) throw new Error("Không thể tải lịch sử tin nhắn");
      const json = await res.json();
      const history: Message[] = json.data || [];
      setMessages(history.reverse());
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử tin nhắn:", err);
    }
  }, [roomId, accessToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!accessToken) return;

    const socket = new SockJS(
      "https://edumentumbackend-production.up.railway.app/ws-chat",
    );
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected");
        setConnected(true);
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          if (message.body) {
            const msg: Message = JSON.parse(message.body);
            setMessages((prev) => [...prev, msg]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [roomId, accessToken]);

  // Gửi tin nhắn
  const handleSendMessage = (content: string) => {
    if (!clientRef.current || !connected) return;

    const message: Message = {
      roomId: Number(roomId),
      senderId: Number(currentUserId),
      senderName: currentUserName || "Anonymous",
      avatar: currentUserAvatar,
      content,
      timestamp: new Date().toISOString(),
    };

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });
  };

  return (
    <Card className="flex h-[480px] w-[360px] flex-col overflow-hidden rounded-lg bg-white shadow-lg">
      <ChatHeader setClose={setClose} />
      <CardContent className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} currentUserId={currentUserId} />
      </CardContent>
      <ChatInput onSend={handleSendMessage} disabled={!connected} />
    </Card>
  );
}
