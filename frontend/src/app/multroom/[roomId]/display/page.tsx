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
      default:
        // messages[messages.length - 1] が文字列で無い場合
        if (messages[messages.length - 1] === undefined) return;
        if (!messages[messages.length - 1]) return;
        // userListから始まるメッセージの場合
        if (messages[messages.length - 1].startsWith("userList")) {
          const userList = messages[messages.length - 1].split("|").slice(1);
          //最後の要素が空文字列の場合削除
          if (userList[userList.length - 1] === "") userList.pop();
          setPlayerName(userList);
          console.log(userList);
        }
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
