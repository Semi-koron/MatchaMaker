"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function QRCodePage() {
  const [isDarkmode, setIsDarkmode] = useState<boolean>(false);
  const param = useParams();

  useEffect(() => {
    const isDarkmode = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkmode(isDarkmode.matches);
    const roomId = param.roomId;
  }, []);

  return (
    <>
      <div>controller</div>
    </>
  );
}
