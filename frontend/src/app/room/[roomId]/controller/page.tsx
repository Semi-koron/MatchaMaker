// ControllerPage.tsx
"use client";
import { useParams } from "next/navigation";
import useRoomJoin from "@/hooks/useRoomJoin";
import useMotion from "@/hooks/useMotion";
import MillstoneController from "@/components/game/millstone/MillstoneController";

export default function ControllerPage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages, sendMessage, isConnected } = useRoomJoin(roomId ?? "");
  const motion = useMotion();

  return (
    <div>
      <h1>📱 石臼コントローラ</h1>
      <MillstoneController
        motion={motion}
        messages={messages}
        isConnected={isConnected}
        sendMessage={sendMessage}
      />
    </div>
  );
}
