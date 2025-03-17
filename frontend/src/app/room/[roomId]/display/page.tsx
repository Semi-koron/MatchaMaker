"use client";
import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import style from "./page.module.css";
import useRoomJoin from "@/hooks/useRoomJoin";
import MillstoneGame from "@/components/game/millstone/MillstoneGame";

export default function QRCodePage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { messages } = useRoomJoin(roomId ?? "");

  const isDarkmode = useMemo(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    []
  );

  const qrCode = useMemo(() => {
    return roomId ? `${window.origin}/room/${roomId}/controller` : "";
  }, [roomId]);

  const isControllerConnected = messages.includes("controller connected");

  return (
    <div className={style["qrcode-page-wrapper"]}>
      {isControllerConnected ? (
        <MillstoneGame messages={messages} />
      ) : (
        <>
          <h1>スマホでこのQRコードを読み込んでね!</h1>
          {qrCode ? (
            <div className={style["qrcode-wrapper"]}>
              <QRCodeSVG
                value={qrCode}
                size={256}
                bgColor={isDarkmode ? "#e7ffde" : "#213b22"}
                fgColor={isDarkmode ? "#213b22" : "#e7ffde"}
              />
            </div>
          ) : (
            <h3>読み込み中...</h3>
          )}
        </>
      )}
    </div>
  );
}
