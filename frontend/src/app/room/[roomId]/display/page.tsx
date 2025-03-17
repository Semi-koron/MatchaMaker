"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import style from "./page.module.css";
import useRoomJoin from "@/hooks/useRoomJoin";
import MillstoneGame from "@/components/game/millstone/MillstoneGame";

export default function QRCodePage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages } = useRoomJoin(roomId ?? "");

  const [currentGame, setCurrentGame] = useState<string>("millstone"); // デフォルトのゲーム

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
    if (messages.includes("anotherGame") && currentGame !== "anotherGame") {
      setCurrentGame("anotherGame");
    } else if (
      messages.includes("millstoneGame") &&
      currentGame !== "millstone"
    ) {
      setCurrentGame("millstone");
    }
  }, [messages, currentGame]); // `messages` の変化を監視

  const renderGame = () => {
    switch (currentGame) {
      case "millstone":
        return <MillstoneGame messages={messages} />;
      case "anotherGame":
        return <h3>別のゲーム</h3>;
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
