"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";

type PluckTeaGameProps = {
  messages: string[];
  sendMessage: (message: string) => void;
};

export default function PluckTeaGame({
  messages,
  sendMessage,
}: PluckTeaGameProps) {
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [count, setCount] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const xTeaPositionRef = useRef(0);
  const yTeaPositionRef = useRef(0);
  const xPleyerPositionRef = useRef(0);
  const yPleyerPositionRef = useRef(0);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    switch (lastMessage) {
      case "finish":
        sendMessage("score" + String(score * 10).padStart(3, "0"));
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
        if (lastMessage === "controller connected") {
          return;
        }
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(lastMessage);
        } catch {
          break;
        }
        const { dx, dy } = parsedMessage;
        xPleyerPositionRef.current += dx;
        yPleyerPositionRef.current += dy;
        const vectorLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        if (xPleyerPositionRef.current < 0) xPleyerPositionRef.current = 0;
        if (yPleyerPositionRef.current < 0) yPleyerPositionRef.current = 0;
        if (xPleyerPositionRef.current > window.innerWidth)
          xPleyerPositionRef.current = window.innerWidth;
        if (yPleyerPositionRef.current > window.innerHeight)
          yPleyerPositionRef.current = window.innerHeight;
        rotationRef.current = Math.atan2(dy / vectorLength, dx / vectorLength);
        // 茶葉を取ったかどうか
        if (messages.includes("start") && !messages.includes("finish")) {
          const distance = Math.sqrt(
            Math.pow(xPleyerPositionRef.current - xTeaPositionRef.current, 2) +
              Math.pow(yPleyerPositionRef.current - yTeaPositionRef.current, 2)
          );
          if (distance < 100) {
            setScore((prev) => prev + 1);
            randomSpownReaf();
          }
        }
        break;
    }
  }, [messages]);

  const randomSpownReaf = () => {
    xTeaPositionRef.current = Math.random() * window.innerWidth;
    yTeaPositionRef.current = Math.random() * window.innerHeight;
  };

  const isDarkmode = useMemo(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    []
  );

  return (
    <>
      {count > 0 ? (
        <h1>{count}</h1>
      ) : (
        <>
          {isFinished ? <h1>終了！</h1> : <h1>茶葉を取れ！</h1>}
          <Image
            src="/player.svg"
            alt="player"
            width={153}
            height={130}
            style={{
              position: "fixed",
              top: `${yPleyerPositionRef.current}px`,
              left: `${xPleyerPositionRef.current}px`,
              transform:
                "translate(-50%, -50%)" +
                `rotate(${rotationRef.current + Math.PI / 2}rad)`,
            }}
          />
          <Image
            src={isDarkmode ? "/tea.svg" : "/tea_dark.svg"}
            alt="tea"
            width={100}
            height={100}
            style={{
              position: "fixed",
              top: `${yTeaPositionRef.current}px`,
              left: `${xTeaPositionRef.current}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <h2
            style={{
              position: "fixed",
              top: "10px",
              left: "10px",
            }}
          >
            スコア: {score}
          </h2>
        </>
      )}
    </>
  );
}
