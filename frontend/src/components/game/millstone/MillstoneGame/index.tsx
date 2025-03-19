"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import style from "./index.module.css";
import { messagesProvider } from "../../util/messagesProvider";

type MillstoneGameProps = {
  messages: string[];
  sendMessage: (message: string) => void;
  playerName: string[];
};

export default function MillstoneGame({
  messages,
  sendMessage,
  playerName,
}: MillstoneGameProps) {
  const millstopneAngleRef = useRef<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    for (let i = 0; i < playerName.length; i++) {
      millstopneAngleRef.current.push(0);
    }
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];

    switch (lastMessage) {
      case "finish":
        for (let i = 0; i < playerName.length; i++) {
          console.log(
            String(
              Math.round((millstopneAngleRef.current[i] / 360) * 30)
            ).padStart(3, "0")
          );
          sendMessage(
            "score" +
              String(
                Math.round((millstopneAngleRef.current[i] / 360) * 30)
              ).padStart(3, "0") +
              playerName[i]
          );
        }
        setIsFinished(true);
        break;
      case "count3":
        setCount(3);
        break;
      case "count2":
        setCount(2);
        break;
      case "count1":
        setCount(1);
        break;
      case "start":
        setCount(0);
        break;
      default:
        //メッセージが ユーザ名:メッセージ という形式の場合
        if (messages.includes("start") && count !== 0) {
          setCount(0);
        }
        if (isFinished) return;
        const { msg, index } = messagesProvider(lastMessage, playerName);
        if (index === -1) {
          break;
        }
        millstopneAngleRef.current[index] = Number(msg);
        break;
    }
  }, [messages]);

  return (
    <div className={style["millstone-wrapper"]}>
      {count > 0 ? (
        <h1>{count}</h1>
      ) : (
        <>
          {isFinished ? (
            <h1>終了</h1>
          ) : (
            <div className={style["player-wrapper"]}>
              {playerName.map((name, index) => (
                <div key={index}>
                  <h3>{name}</h3>
                  <Image
                    src="/millstone.svg"
                    alt="millstone"
                    width={256}
                    height={256}
                    style={{
                      transform: `rotate(${millstopneAngleRef.current[index]}deg)`,
                    }}
                  />
                  <h2>
                    {Math.floor(millstopneAngleRef.current[index] / 360)}回転
                  </h2>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
