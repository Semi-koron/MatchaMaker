"use client";
import { useEffect, useRef, useState } from "react";
import TeaLeafIcon from "@/components/TeaReafIcon/";
import style from "./index.module.css";

type FermentationGameProps = {
  sendMessage: (message: string) => void;
  messages: string[];
};

export default function FermentationGame({
  sendMessage,
  messages,
}: FermentationGameProps) {
  const startColor = "#62E466"; // 開始色
  const endColor = "#644B2A"; // 終了色
  const duration = 20000; // 変化にかかる時間（ミリ秒）
  const steps = 100; // 色変化のステップ数
  const intervalTime = duration / steps;

  const [color, setColor] = useState(startColor);
  const [goalColor, setGoalColor] = useState<string>("#000000");
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isStarted = messages.includes("start");

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= steps) {
        clearInterval(interval);
        return;
      }
      step++;
      setColor(interpolateColor(startColor, endColor, step / steps));
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.querySelectorAll("path").forEach((path) => {
        path.setAttribute("fill", color);
      });
    }
  }, [color]);

  useEffect(() => {
    if (goalColor === "#000000") {
      const goal = getRandomColor(startColor, endColor);
      setGoalColor(goal);
    }
  }, [goalColor, setGoalColor]);

  useEffect(() => {
    if (messages[messages.length - 1] === "stop" && !isStopped) {
      setIsStopped(true);
      setSelectedColor(color);
      const score = scoreCalc(color);
      // 3秒後にスコアを送信
      setTimeout(() => {
        sendMessage("score" + String(score).padStart(3, "0"));
      }, 3000);
    }
  }, [messages]);

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

  const hexToRgb = (hex: string) =>
    hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));

  // カラー補間関数（HEX → RGB → 補間 → HEX）
  function interpolateColor(
    start: string,
    end: string,
    factor: number
  ): string {
    const startRGB = hexToRgb(start);
    const endRGB = hexToRgb(end);
    const resultRGB = startRGB.map((start, i) =>
      Math.round(start + (endRGB[i] - start) * factor)
    );

    return rgbToHex(resultRGB[0], resultRGB[1], resultRGB[2]);
  }

  // ランダムに色を選択する関数
  function getRandomColor(start: string, end: string): string {
    const randomFactor = Math.random(); // 0から1の間のランダムな数値を生成
    return interpolateColor(start, end, randomFactor); // その数値を使って色を補間
  }

  const scoreCalc = (select: string) => {
    // 選ばれた色と目標色の差を計算
    const selectedRGB = hexToRgb(select);
    const goalRGB = hexToRgb(goalColor);
    const diffRGB = selectedRGB.map((selected, i) =>
      Math.abs(selected - goalRGB[i])
    );
    // 差を合計
    const totalDiff = diffRGB.reduce((acc, cur) => acc + cur);
    // スコアを計算
    const score = 300 - totalDiff;
    return score;
  };

  return (
    <>
      {isStarted ? (
        <>
          {isStopped ? (
            <>
              <h2>発酵終了</h2>
              <div className={style["result-wrapper"]}>
                <div className={style["color-wrapper"]}>
                  <h3>目標色</h3>
                  <div
                    className={style["goal-color"]}
                    style={{
                      backgroundColor: goalColor,
                    }}
                  ></div>
                </div>
                <div className={style["color-wrapper"]}>
                  <h3>あなたの色</h3>
                  <div
                    className={style["goal-color"]}
                    style={{
                      backgroundColor: selectedColor,
                    }}
                  ></div>
                </div>
              </div>
              <h3>スコア: {scoreCalc(selectedColor)}</h3>
            </>
          ) : (
            <>
              <h2>発酵中</h2>
              <TeaLeafIcon color={color} />
              <h3>発酵を辞める時はスマホを持ち上げる</h3>
            </>
          )}
        </>
      ) : (
        <>
          <h2>この色を覚えて!!</h2>
          <div
            className={style["goal-color"]}
            style={{
              backgroundColor: goalColor,
            }}
          ></div>
          <h4>スマホは机の上においてね</h4>
        </>
      )}
    </>
  );
}
