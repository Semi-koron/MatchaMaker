import { Button } from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      const scoreList = lastMessage.split("|");
      //scoreList|いいい@511|あああ@474|
      const scoreData = scoreList.map((score, index) => {
        if (index === 0) return;
        const [name, point] = score.split("@");
        //playerNameからnameを探して、そのindexを取得
        const nameIndex = playerName.indexOf(name);
        return { nameIndex, point: Number(point) };
      });
      const score = Array(playerName.length).fill(0);
      scoreData.forEach((data) => {
        if (data) score[data.nameIndex] = data.point;
      });
      setScore(score);
    }
  }, [messages]);

  return (
    <div className={style["result-wrapper"]}>
      <h2>完成</h2>
      <Image
        src="/drink_maccha.png"
        alt="Matcha drink"
        width={250}
        height={250}
      />
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
