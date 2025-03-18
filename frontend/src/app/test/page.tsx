"use client";
import { useEffect, useRef, useState } from "react";
import TeaLeafIcon from "@/components/TeaReafIcon/";

export default function TestPage() {
  const startColor = "#62E466"; // 開始色
  const endColor = "#644B2A"; // 終了色
  const duration = 20000; // 変化にかかる時間（ミリ秒）
  const steps = 100; // 色変化のステップ数
  const intervalTime = duration / steps;

  const [color, setColor] = useState(startColor);
  const svgRef = useRef<SVGSVGElement | null>(null);

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

  return <TeaLeafIcon color={color} />;
}

// カラー補間関数（HEX → RGB → 補間 → HEX）
function interpolateColor(start: string, end: string, factor: number): string {
  const hexToRgb = (hex: string) =>
    hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));

  const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;

  const startRGB = hexToRgb(start);
  const endRGB = hexToRgb(end);
  const resultRGB = startRGB.map((start, i) =>
    Math.round(start + (endRGB[i] - start) * factor)
  );

  return rgbToHex(resultRGB[0], resultRGB[1], resultRGB[2]);
}
