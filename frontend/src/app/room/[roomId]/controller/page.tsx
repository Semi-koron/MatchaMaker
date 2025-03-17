"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useRoomJoin from "@/hooks/useRoomJoin";
import useMotion from "@/hooks/useMotion";
import useOrientation from "@/hooks/useOrientation";
import MillstoneController from "@/components/game/millstone/MillstoneController";
import PluckTeaController from "@/components/game/pluckTea/PluckTeaController";

export default function ControllerPage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages, sendMessage, clearMessages } = useRoomJoin(roomId ?? "");
  const motion = useMotion();
  const orientation = useOrientation();

  const [currentGame, setCurrentGame] = useState<string>("pluckTeaGame"); // デフォルトのゲーム

  useEffect(() => {
    switch (messages[messages.length - 1]) {
      case "pluckTeaGame":
        if (currentGame !== "pluckTeaGame") {
          setCurrentGame("pluckTeaGame");
          clearMessages();
        }
        break;
      case "millstoneGame":
        if (currentGame !== "millstoneGame") {
          setCurrentGame("millstoneGame");
          clearMessages();
          sendMessage("nextGame");
        }
        break;
    }
  }, [messages, currentGame]); // `messages` の変化を監視

  const renderController = () => {
    switch (currentGame) {
      case "millstoneGame":
        return (
          <MillstoneController
            motion={motion}
            messages={messages}
            sendMessage={sendMessage}
          />
        );
      case "pluckTeaGame":
        return (
          <PluckTeaController
            orientation={orientation}
            messages={messages}
            sendMessage={sendMessage}
          />
        );
      default:
        return <h3>ゲームの選択肢が見つかりません。</h3>;
    }
  };

  return <div>{renderController()}</div>;
}
