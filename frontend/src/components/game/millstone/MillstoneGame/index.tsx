"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import style from "./index.module.css";

type MillstoneGameProps = {
  messages: string[];
  sendMessage: (message: string) => void;
};

export default function MillstoneGame({
  messages,
  sendMessage,
}: MillstoneGameProps) {
  const [millstoneAngle, setMillstoneAngle] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];

    switch (lastMessage) {
      case "finish":
        console.log(
          String(Math.round((millstoneAngle / 360) * 30)).padStart(3, "0")
        );
        sendMessage(
          "score" +
            String(Math.round((millstoneAngle / 360) * 30)).padStart(3, "0")
        );
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
        const angle = parseFloat(lastMessage);
        if (!isNaN(angle)) setMillstoneAngle(angle);
        break;
    }
  }, [messages]);

  return (
    <div className={style["millstone-wrapper"]}>
      {count > 0 ? (
        <h1>{count}</h1>
      ) : (
        <>
          {isFinished ? <h1>終了！</h1> : <h1>スマホを回せ！</h1>}
          <Image
            src="/millstone.svg"
            alt="millstone"
            width={256}
            height={256}
            style={{
              transform: `rotate(${millstoneAngle}deg)`,
            }}
          />
          <h2>{Math.floor(millstoneAngle / 360)}回転</h2>
        </>
      )}
    </div>
  );
}
