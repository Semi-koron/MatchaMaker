import { useEffect, useState, useRef } from "react";

const useRoomJoin = (roomId: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // WebSocket の URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "localhost:8080";
    const protocol = process.env.NEXT_PUBLIC_USE_SSL === "false" ? "ws" : "wss";
    const socket = new WebSocket(`${protocol}://${baseUrl}/multroom/${roomId}`);
    socketRef.current = socket;

    // 接続成功
    socket.onopen = () => {
      console.log(`✅ Connected to room: ${roomId}`);
      setIsConnected(true);
    };

    // メッセージ受信
    socket.onmessage = (event) => {
      console.log(`📩 Message received: ${event.data}`);
      setMessages((prev) => {
        // 既に含まれているなら変更しない
        if (prev.includes(event.data)) return prev;
        // 必要なメッセージを維持する
        const importantMessages = [
          "controller connected",
          "start",
          "finish",
          "count3",
          "count2",
          "count1",
          "millstoneGame",
          "pluckTeaGame",
          "fermentationGame",
          "result",
        ];
        const filteredMessages = importantMessages.filter((msg) =>
          prev.includes(msg),
        );

        return [...filteredMessages, event.data];
      });
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
  }, [roomId]); // roomId が変更されるたびに WebSocket 接続を再作成

  // メッセージ送信
  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("❌ WebSocket is not open");
    }
  };

  // メッセージのクリア
  const clearMessages = () => {
    setMessages(["controller connected"]);
  };

  return { messages, sendMessage, clearMessages, isConnected };
};

export default useRoomJoin;
