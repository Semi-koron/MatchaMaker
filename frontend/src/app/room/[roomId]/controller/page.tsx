"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function QRCodePage() {
  const param = useParams();

  useEffect(() => {
    const roomId = param.roomId;
  }, []);

  return (
    <>
      <div>controller</div>
    </>
  );
}
