import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "./index.module.css";

type ResultProps = {
  sendMessage: (message: string) => void;
  messages: string[];
};

export default function Result({ sendMessage, messages }: ResultProps) {
  const [score, setScore] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    sendMessage("result");
    messages;
    console.log("Result");
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];

    // lastMessageが"total score"で始まる場合
    if (lastMessage.startsWith("total score")) {
      const total = parseInt(lastMessage.slice(11));
      setScore(total);
    }
  }, [messages]);

  return (
    <div className={style["result-wrapper"]}>
      <h1>total score: {score}</h1>

      <Button onClick={() => router.push("/")}>
        <h2>タイトル画面へ</h2>
      </Button>
    </div>
  );
}
