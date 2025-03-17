"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import useRoomJoin from "@/hooks/useRoomJoin";

export default function QRCodePage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages, sendMessage, isConnected } = useRoomJoin(roomId ?? "");

  useEffect(() => {
    console.log("coneect");
    if (isConnected) {
      sendMessage("controller connected");
    }
  }, [isConnected]);

  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  return (
    <>
      <div>controller</div>
    </>
  );
}
