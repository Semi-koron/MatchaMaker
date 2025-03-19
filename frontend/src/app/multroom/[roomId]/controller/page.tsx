"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useRoomJoin from "@/hooks/useRoomJoin";
import useMotion from "@/hooks/useMotion";
import useOrientation from "@/hooks/useOrientation";
import MillstoneController from "@/components/game/millstone/MillstoneController";
import PluckTeaController from "@/components/game/pluckTea/PluckTeaController";
import FermentationController from "@/components/game/fermentation/FermentationController";
import style from "./page.module.css";
import Permission from "@/components/game/Permission";

export default function ControllerPage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages, sendMessage, clearMessages } = useRoomJoin(roomId ?? "");
  const motion = useMotion();
  const orientation = useOrientation();
  const router = useRouter();

  const [currentGame, setCurrentGame] = useState<string>("loading"); // デフォルトのゲーム

  useEffect(() => {
    switch (messages[messages.length - 1]) {
      case "pluckTeaGame":
        if (currentGame !== "pluckTeaGame") {
          setCurrentGame("pluckTeaGame");
          clearMessages();
        }
        break;
      case "fermentationGame":
        if (currentGame !== "fermentationGame") {
          setCurrentGame("fermentationGame");
          clearMessages();
        }
        break;
      case "millstoneGame":
        if (currentGame !== "millstoneGame") {
          setCurrentGame("millstoneGame");
          clearMessages();
        }
        break;
    }
  }, [messages, currentGame, clearMessages]); // `messages` の変化を監視

  const renderController = () => {
    switch (currentGame) {
      case "loading":
        return <Permission sendMessage={sendMessage} messages={messages} />;
      case "pluckTeaGame":
        return (
          <PluckTeaController
            orientation={orientation}
            sendMessage={sendMessage}
            messages={messages}
          />
        );
      case "fermentationGame":
        return (
          <FermentationController
            motion={motion}
            messages={messages}
            sendMessage={sendMessage}
          />
        );
      case "millstoneGame":
        return (
          <MillstoneController
            motion={motion}
            messages={messages}
            sendMessage={sendMessage}
          />
        );
      case "resultPage":
        router.push("/");
      default:
        return <h3>ゲームの選択肢が見つかりません。</h3>;
    }
  };

  return (
    <div className={style["controller-wrapper"]}>{renderController()}</div>
  );
}
