import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import style from "./index.module.css";

type ResultProps = {
  sendMessage: (message: string) => void;
  messages: string[];
  playerName: string[];
};

export default function Result({
  sendMessage,
  messages,
  playerName,
}: ResultProps) {
  const [score, setScore] = useState<number[]>();
  const router = useRouter();

  useEffect(() => {
    sendMessage("result");
  }, []);

  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];

    // lastMessageが"total score"で始まる場合
    if (lastMessage.startsWith("scoreList")) {
      const scoreList = lastMessage.split("|")[1].split("|");
      const score = scoreList.map((score) => {
        return parseInt(score.split("@")[1]);
      });
      setScore(score);
    }
  }, [messages]);

  return (
    <div className={style["result-wrapper"]}>
      {score?.map((score, index) => {
        return (
          <div key={index} className={style["score-wrapper"]}>
            <h2>
              {playerName[index]}: {score}
            </h2>
          </div>
        );
      })}
      <Button onClick={() => router.push("/")}>
        <h2>タイトル画面へ</h2>
      </Button>
    </div>
  );
}
