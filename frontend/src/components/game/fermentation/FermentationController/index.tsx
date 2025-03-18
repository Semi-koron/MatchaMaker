import { useEffect } from "react";

type FermentationControllerProps = {
  motion: { z: number } | null;
  messages: string[];
  sendMessage: (message: string) => void;
};

const FermentationController = ({
  motion,
  messages,
  sendMessage,
}: FermentationControllerProps) => {
  useEffect(() => {
    const isStarted = messages.includes("start");
    const isFinished = messages.includes("finish");
    if (motion && !isFinished && isStarted) {
      if (motion.z > 0.5 || motion.z < -0.5) {
        sendMessage("stop");
      }
    }
  }, [motion]);

  return <h1>発酵中</h1>;
};

export default FermentationController;
