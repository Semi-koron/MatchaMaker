"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import style from "./page.module.css";

export default function QRCodePage() {
  const [qrCode, setQRCode] = useState<string>("");
  const [isDarkmode, setIsDarkmode] = useState<boolean>(false);
  const param = useParams();

  useEffect(() => {
    const isDarkmode = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkmode(isDarkmode.matches);
    const roomId = param.roomId;
    //現在のurlを取得
    const url = window.origin + "/room/" + roomId + "/controller";
    setQRCode(url);
  }, []);

  return (
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
  );
}
