import { useState, useEffect } from "react";

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

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return orientation;
};

export default useOrientation;
