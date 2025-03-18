"use client";
import { useEffect } from "react";

type PluckTeaControllerProps = {
  orientation: { gamma: number; beta: number } | null;
  messages: string[];
  sendMessage: (message: string) => void;
};

export default function PluckTeaController({
  orientation,
  sendMessage,
}: PluckTeaControllerProps) {
  useEffect(() => {
    const handleOrientation = () => {
      console.log("handleOrientation");
      if (orientation) {
        const stringJson = JSON.stringify({
          dx: orientation.gamma,
          dy: orientation.beta,
        });
        sendMessage(stringJson);
      }
    };
    // 1秒間に60回実行
    const intervalId = setInterval(handleOrientation, 1000 / 10);
    return () => clearInterval(intervalId);
  }, [orientation]);

  return (
    <div>
      <h1>PluckTeaController</h1>
    </div>
  );
}
