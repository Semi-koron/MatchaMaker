"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMemo } from "react";
import { messagesProvider } from "../../util/messagesProvider";

type PluckTeaGameProps = {
  messages: string[];
  sendMessage: (message: string) => void;
  playerName: string[];
};

export default function PluckTeaGame({
  messages,
  sendMessage,
  playerName,
}: PluckTeaGameProps) {
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [count, setCount] = useState<number>(3);
  const [score, setScore] = useState<number[]>([]);
  const xTeaPositionRef = useRef<number>(0);
  const yTeaPositionRef = useRef<number>(0);
  const xPleyerPositionRef = useRef<number[]>([]);
  const yPleyerPositionRef = useRef<number[]>([]);
  const rotationRef = useRef<number[]>([]);

  useEffect(() => {
    for (let i = 0; i < playerName.length; i++) {
      xPleyerPositionRef.current.push(window.innerWidth / 2);
      yPleyerPositionRef.current.push(window.innerHeight / 2);
      rotationRef.current.push(0);
      setScore((prev) => [...prev, 0]);
    }
    randomSpownReaf();
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    switch (lastMessage) {
      case "finish":
        for (let i = 0; i < playerName.length; i++) {
          sendMessage(
            "score" + String(score[i]).padStart(3, "0") + playerName[i]
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
        if (lastMessage === "controller connected") {
          return;
        }
        const { msg, index } = messagesProvider(lastMessage, playerName);
        if (index === -1) {
          return;
        }
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(msg);
        } catch {
          break;
        }
        const { dx, dy } = parsedMessage;
        xPleyerPositionRef.current[index] += dx;
        yPleyerPositionRef.current[index] += dy;
        const vectorLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        if (xPleyerPositionRef.current[index] < 0)
          xPleyerPositionRef.current[index] = 0;
        if (yPleyerPositionRef.current[index] < 0)
          yPleyerPositionRef.current[index] = 0;
        if (xPleyerPositionRef.current[index] > window.innerWidth)
          xPleyerPositionRef.current[index] = window.innerWidth;
        if (yPleyerPositionRef.current[index] > window.innerHeight)
          yPleyerPositionRef.current[index] = window.innerHeight;
        rotationRef.current[index] = Math.atan2(
          dy / vectorLength,
          dx / vectorLength
        );
        // 茶葉を取ったかどうか
        if (messages.includes("start") && !isFinished) {
          const distance = Math.sqrt(
            Math.pow(
              xPleyerPositionRef.current[index] - xTeaPositionRef.current,
              2
            ) +
              Math.pow(
                yPleyerPositionRef.current[index] - yTeaPositionRef.current,
                2
              )
          );
          if (distance < 100) {
            setScore((prev) => {
              const newScore = [...prev];
              newScore[index] += 1;
              return newScore;
            });
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
          {isFinished ? <h1>終了</h1> : <h1>茶葉を取れ！</h1>}
          {playerName.map((_, index) => (
            // プレイヤーの名前を上に表示
            <div key={index}>
              <h3
                style={{
                  position: "fixed",
                  top: `${yPleyerPositionRef.current[index] - 80}px`,
                  left: `${xPleyerPositionRef.current[index]}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {playerName[index]}
              </h3>
              <Image
                src="/player.svg"
                alt="player"
                width={153}
                height={130}
                style={{
                  position: "fixed",
                  top: `${yPleyerPositionRef.current[index]}px`,
                  left: `${xPleyerPositionRef.current[index]}px`,
                  transform:
                    "translate(-50%, -50%)" +
                    `rotate(${rotationRef.current[index] + Math.PI / 2}rad)`,
                  zIndex: 10,
                }}
              />
            </div>
          ))}
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
            {
              // 全員のスコアを表示
              playerName.map((name, index) => (
                <div key={index}>
                  {name}: {score[index]}
                </div>
              ))
            }
          </h2>
        </>
      )}
    </>
  );
}
