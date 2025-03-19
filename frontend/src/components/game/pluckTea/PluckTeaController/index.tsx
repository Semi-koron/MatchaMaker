"use client";
import { useEffect } from "react";

type PluckTeaControllerProps = {
  orientation: { gamma: number; beta: number } | null;
  sendMessage: (message: string) => void;
  messages: string[];
};

export default function PluckTeaController({
  orientation,
  sendMessage,
  messages,
}: PluckTeaControllerProps) {
  const isFinished = messages.includes("finish");
  const isStarted = messages.includes("start");
  useEffect(() => {
    const handleOrientation = () => {
      if (isFinished || !isStarted) {
        return;
      }
      if (orientation) {
        const stringJson = JSON.stringify({
          dx: orientation.gamma,
          dy: orientation.beta,
        });
        sendMessage(stringJson);
      }
    };
    // 1秒間に60回実行
    const intervalId = setInterval(handleOrientation, 1000 / 60);
    return () => clearInterval(intervalId);
  }, [orientation]);

  return (
    <div>
      <h1>PluckTeaController</h1>
    </div>
  );
}
