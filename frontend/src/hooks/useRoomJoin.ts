import { useEffect, useState, useRef } from "react";

const useRoomJoin = (roomId: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // WebSocket の URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:8080";
    const socket = new WebSocket(`wss://${baseUrl}/room/${roomId}`);
    socketRef.current = socket;

    // 接続成功
    socket.onopen = () => {
      console.log(`✅ Connected to room: ${roomId}`);
      setIsConnected(true);
    };

    // メッセージ受信
    socket.onmessage = (event) => {
      console.log("📩 Received:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    // エラー処理
    socket.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    // 切断処理
    socket.onclose = (event) => {
      console.warn(`⚠️ WebSocket closed: ${event.code}, ${event.reason}`);
      setIsConnected(false);
    };

    // クリーンアップ（コンポーネントがアンマウントされたとき）
    return () => {
      console.log(`🔌 Disconnecting from room: ${roomId}`);
      socket.close();
    };
  }, [roomId]);

  // メッセージ送信
  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("❌ WebSocket is not open");
    }
  };

  return { messages, sendMessage, isConnected };
};

export default useRoomJoin;
