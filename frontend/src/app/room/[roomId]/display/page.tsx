"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import style from "./page.module.css";
import useRoomJoin from "@/hooks/useRoomJoin";
import MillstoneGame from "@/components/game/millstone/MillstoneGame";
import PluckTeaGame from "@/components/game/pluckTea/PluckTeaGame";
import Result from "@/components/game/Result/page";
import FermentationGame from "@/components/game/fermentation/FermentationGame";

export default function QRCodePage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages, clearMessages, sendMessage } = useRoomJoin(roomId ?? "");

  const [currentGame, setCurrentGame] = useState<string>("pluckTeaGame"); // デフォルトのゲーム

  const isDarkmode = useMemo(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    []
  );

  const qrCode = useMemo(() => {
    return roomId ? `${window.origin}/room/${roomId}/controller` : "";
  }, [roomId]);

  const isControllerConnected = messages.includes("controller connected");

  // メッセージを監視してゲームを切り替える
  useEffect(() => {
    switch (messages[messages.length - 1]) {
      case "pluckTeaGame":
        if (currentGame !== "pluckTeaGame") {
          clearMessages();
          setCurrentGame("pluckTeaGame");
        }
        break;
      case "fermentationGame":
        if (currentGame !== "fermentationGame") {
          clearMessages();
          setCurrentGame("fermentationGame");
          sendMessage("nextGame");
        }
        break;
      case "millstoneGame":
        if (currentGame !== "millstoneGame") {
          clearMessages();
          setCurrentGame("millstoneGame");
          sendMessage("nextGame");
        }
        break;
      case "resultPage":
        if (currentGame !== "resultPage") {
          setCurrentGame("resultPage");
          clearMessages();
        }
    }
  }, [messages, currentGame, clearMessages, sendMessage]); // `messages` の変化を監視

  const renderGame = () => {
    switch (currentGame) {
      case "pluckTeaGame":
        return <PluckTeaGame messages={messages} sendMessage={sendMessage} />;
      case "fermentationGame":
        return (
          <FermentationGame messages={messages} sendMessage={sendMessage} />
        );
      case "millstoneGame":
        return <MillstoneGame messages={messages} sendMessage={sendMessage} />;
      case "resultPage":
        return <Result messages={messages} sendMessage={sendMessage} />;
      default:
        return <h3>ゲームの選択肢が見つかりません。</h3>;
    }
  };

  return (
    <div className={style["qrcode-page-wrapper"]}>
      {isControllerConnected ? (
        renderGame() // 現在遊んでいるゲームを表示
      ) : (
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
        </>
      )}
    </div>
  );
}
