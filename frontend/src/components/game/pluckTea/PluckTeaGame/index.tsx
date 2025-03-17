"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type PluckTeaGameProps = {
  messages: string[];
};

export default function PluckTeaGame({ messages }: PluckTeaGameProps) {
  const [millstoneAngle, setMillstoneAngle] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [count, setCount] = useState<number>(3);
  const xPleyerPositionRef = useRef(0);
  const yPleyerPositionRef = useRef(0);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    switch (lastMessage) {
      case "finish":
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
        } catch (e) {
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
        break;
    }
  }, [messages]);

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
        </>
      )}
    </>
  );
}
