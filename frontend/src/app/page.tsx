"use client";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";
import style from "./page.module.css";

export default function Title() {
  const router = useRouter();

  const handleClick = () => {
    (DeviceMotionEvent as any).requestPermission?.().then((response: any) => {
      if (response === "granted") {
        console.log("granted");
      }
    });
    // roomIdをランダムに生成
    const roomId = Math.random().toString(36).slice(-8);
    const url = "/room/" + roomId + "/display";
    router.push(url);
  };

  return (
    <div className={style["title-wrapper"]}>
      <h1>Matcha Maker</h1>
      <Button onClick={handleClick}>
        <h3>抹茶を挽く</h3>
      </Button>
    </div>
  );
}
