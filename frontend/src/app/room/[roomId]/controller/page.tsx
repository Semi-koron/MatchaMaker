"use client";
import { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useRoomJoin from "@/hooks/useRoomJoin";
import useMotion from "@/hooks/useMotion";

export default function QRCodePage() {
  const param = useParams();
  const roomId = param.roomId as string | undefined;
  const { sendMessage, isConnected } = useRoomJoin(roomId ?? "");
  const motion = useMotion();

  const [millstoneAngle, setMillstoneAngle] = useState<number>(0); // 石臼の回転角度
  const [angularVelocity, setAngularVelocity] = useState<number>(0); // 角速度 (ω)

  const inertia = 1; // 慣性モーメント (適当な値、調整可能)
  const friction = 0.4; // 摩擦による減衰率 (少しずつ減衰)

  useEffect(() => {
    console.log("connect");
    if (isConnected) {
      sendMessage("controller connected");
    }
  }, [isConnected]);

  useEffect(() => {
    if (motion) {
      const dt = 0.05; // 時間間隔 (50ms)

      // 石臼の持ち手の角度に基づいて、加速度を回転方向に変換
      const tangentialAcceleration =
        motion.x * Math.cos(millstoneAngle * (Math.PI / 180)) +
        motion.z * Math.sin(millstoneAngle * (Math.PI / 180));
      // トルク τ = r × F = r × m × a (ここでは単位質量 m=1)
      const torque = tangentialAcceleration;

      // 角加速度 α = τ / I
      let angularAcceleration = torque / inertia;
      if (angularAcceleration < 0) {
        angularAcceleration = 0;
      }

      // 角速度の更新 (摩擦を考慮)
      setAngularVelocity((prev) => prev * friction + angularAcceleration * dt);

      // 角度の更新
      setMillstoneAngle(
        (prev) => prev + (angularVelocity * dt * 180) / Math.PI
      );
    }
  }, [motion]);

  // 定期的に millstoneAngle を送信する
  useEffect(() => {
    if (!isConnected) {
      return;
    }
    sendMessage(millstoneAngle.toString());
  }, [millstoneAngle, isConnected]);

  return (
    <div>
      <h1>📱 石臼コントローラ</h1>
      <h2>回転角度: {Math.round(millstoneAngle)}°</h2>
      <h3>角速度: {angularVelocity.toFixed(2)} rad/s</h3>
    </div>
  );
}
