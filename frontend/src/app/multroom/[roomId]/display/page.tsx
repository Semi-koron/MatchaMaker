"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import style from "./page.module.css";
import useRoomJoin from "@/hooks/useRoomJoin";
import { Button } from "@/components/Button";
import MillstoneGame from "@/components/game/millstone/MillstoneGame";
import PluckTeaGame from "@/components/game/pluckTea/PluckTeaGame";
import Result from "@/components/game/Result";
import FermentationGame from "@/components/game/fermentation/FermentationGame";

export default function QRCodePage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages, clearMessages, sendMessage } = useRoomJoin(roomId ?? "");

  const [currentGame, setCurrentGame] = useState<string>("loading");
  const [playerName, setPlayerName] = useState<string[]>([]);

  const isDarkmode = useMemo(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    []
  );

  const qrCode = useMemo(() => {
    return roomId ? `${window.origin}/multroom/${roomId}/controller` : "";
  }, [roomId]);

  // メッセージを監視してゲームを切り替える
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (latestMessage === undefined || !latestMessage) return;

    if (
      latestMessage.includes("pluckTeaGame") &&
      currentGame !== "pluckTeaGame"
    ) {
      clearMessages();
      setCurrentGame("pluckTeaGame");
    } else if (
      latestMessage.includes("fermentationGame") &&
      currentGame !== "fermentationGame"
    ) {
      clearMessages();
      setCurrentGame("fermentationGame");
      sendMessage("nextGame");
    } else if (
      latestMessage.includes("millstoneGame") &&
      currentGame !== "millstoneGame"
    ) {
      clearMessages();
      setCurrentGame("millstoneGame");
      sendMessage("nextGame");
    } else if (
      latestMessage.includes("resultPage") &&
      currentGame !== "resultPage"
    ) {
      setCurrentGame("resultPage");
      clearMessages();
    } else if (latestMessage.startsWith("userList")) {
      const userList = latestMessage.split("|").slice(1);
      if (userList[userList.length - 1] === "") userList.pop();
      setPlayerName(userList);
      sendMessage("pluckTeaStart");
    }
  }, [messages, currentGame, clearMessages, sendMessage]); // `messages` の変化を監視

  const renderGame = () => {
    switch (currentGame) {
      case "loading":
        return (
          <>
            <h1>スマホでこのQRコードを読み込んでね!</h1>
            {qrCode ? (
              <div className={style["qrcode-wrapper"]}>
                <QRCodeSVG
                  value={qrCode}
                  size={256}
                  bgColor={isDarkmode ? "#e7ffde" : "#213b22"}
                  fgColor={isDarkmode ? "#213b22" : "#e7ffde"}
                />
              </div>
            ) : (
              <h3>読み込み中...</h3>
            )}

            <Button
              onClick={() => {
                sendMessage("gameStart");
              }}
            >
              ゲーム開始
            </Button>
          </>
        );
      case "pluckTeaGame":
        return (
          <PluckTeaGame
            messages={messages}
            sendMessage={sendMessage}
            playerName={playerName}
          />
        );
      case "fermentationGame":
        return (
          <FermentationGame
            messages={messages}
            sendMessage={sendMessage}
            playerName={playerName}
          />
        );
      case "millstoneGame":
        return (
          <MillstoneGame
            messages={messages}
            sendMessage={sendMessage}
            playerName={playerName}
          />
        );
      case "resultPage":
        return (
          <Result
            messages={messages}
            sendMessage={sendMessage}
            playerName={playerName}
          />
        );
      default:
        return <h3>ゲームの選択肢が見つかりません。</h3>;
    }
  };

  return (
    <div className={style["qrcode-page-wrapper"]}>
      {
        renderGame() // 現在遊んでいるゲームを表示
      }
    </div>
  );
}
