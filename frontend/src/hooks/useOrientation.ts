import { useState, useEffect } from "react";

const useOrientation = () => {
  const [orientation, setOrientation] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const requestPermission = async () => {
      // `requestPermission` が存在するかチェック
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        "requestPermission" in DeviceOrientationEvent
      ) {
        try {
          // `requestPermission` を呼び出し、許可を求める
          const permission = await (
            DeviceOrientationEvent as typeof DeviceOrientationEvent & {
              requestPermission: () => Promise<string>;
            }
          ).requestPermission();
          setPermissionGranted(permission === "granted");
        } catch (error) {
          console.error("DeviceOrientation permission request failed:", error);
          setPermissionGranted(false);
        }
      } else {
        // `requestPermission` が不要な環境（Android など）
        setPermissionGranted(true);
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha ?? 0, // 方位角（ヨー）
        beta: event.beta ?? 0, // 前後の傾き（ピッチ）
        gamma: event.gamma ?? 0, // 左右の傾き（ロール）
      });
    };

    if (permissionGranted === true) {
      window.addEventListener("deviceorientation", handleOrientation);
    } else if (permissionGranted === null) {
      requestPermission();
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [permissionGranted]);

  return { orientation, permissionGranted };
};

export default useOrientation;
