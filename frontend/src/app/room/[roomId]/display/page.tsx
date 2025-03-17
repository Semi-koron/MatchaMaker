"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import style from "./page.module.css";
import useRoomJoin from "@/hooks/useRoomJoin";

export default function QRCodePage() {
  const [qrCode, setQRCode] = useState<string>("");
  const [linked, setLinked] = useState<boolean>(false);
  const [isDarkmode, setIsDarkmode] = useState<boolean>(false);
  const [millstoneAngle, setMillstoneAngle] = useState<number>(0);
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages } = useRoomJoin(roomId ?? "");

  useEffect(() => {
    const isDarkmode = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkmode(isDarkmode.matches);
    const roomId = param.roomId;
    //現在のurlを取得
    const url = window.origin + "/room/" + roomId + "/controller";
    setQRCode(url);
  }, []);

  useEffect(() => {
    console.log("messages", messages);
    if (messages[messages.length - 1] === "controller connected") {
      setLinked(true);
    } else {
      const angle = parseFloat(messages[messages.length - 1]);
      setMillstoneAngle(angle);
    }
  }, [messages]);

  return (
    <>
      {linked ? (
        <div className={style["qrcode-page-wrapper"]}>
          <h1>回せ！</h1>
          <Image
            src="/millstone.svg"
            alt="millstone"
            width={256}
            height={256}
            style={{
              transform: `rotate(${millstoneAngle}deg)`,
            }}
          />
        </div>
      ) : (
        <>
          <div className={style["qrcode-page-wrapper"]}>
            <h1> スマホでこのQRコードを読み込んでね!</h1>
            {qrCode ? (
              isDarkmode ? (
                <div className={style["qrcode-wrapper"]}>
                  <QRCodeSVG
                    value={qrCode}
                    size={256}
                    bgColor="#e7ffde"
                    fgColor="#213b22"
                  />
                </div>
              ) : (
                <span className={style["qrcode-wrapper"]}>
                  <QRCodeSVG
                    value={qrCode}
                    size={256}
                    bgColor="#213b22"
                    fgColor="#e7ffde"
                  />
                </span>
              )
            ) : (
              <h3>読み込み中...</h3>
            )}
          </div>
        </>
      )}
    </>
  );
}
