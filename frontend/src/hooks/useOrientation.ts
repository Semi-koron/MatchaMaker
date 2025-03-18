import { useState, useEffect } from "react";

const requestPermission = async () => {
  // @ts-expect-error only safari property
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const permissionState =
        // @ts-expect-error only safari property
        await DeviceOrientationEvent.requestPermission();
      if (permissionState !== "granted") {
        console.warn("Device Orientation permission denied.");
      }
    } catch (error) {
      console.error("Error requesting Device Orientation permission:", error);
    }
  }
};

const useOrientation = () => {
  const [orientation, setOrientation] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha ?? 0, // 方位角（ヨー）
        beta: event.beta ?? 0, // 前後の傾き（ピッチ）
        gamma: event.gamma ?? 0, // 左右の傾き（ロール）
      });
    };
    requestPermission();
    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return orientation;
};

export default useOrientation;
