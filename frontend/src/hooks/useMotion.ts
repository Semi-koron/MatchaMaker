import { useState, useEffect } from "react";

const useMotion = () => {
  const [acceleration, setAcceleration] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const requestPermission = async () => {
      // `requestPermission` が存在するかチェック
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        "requestPermission" in DeviceMotionEvent
      ) {
        try {
          // `requestPermission` を呼び出し、許可を求める
          const permission = await (
            DeviceMotionEvent as typeof DeviceMotionEvent & {
              requestPermission: () => Promise<string>;
            }
          ).requestPermission();
          setPermissionGranted(permission === "granted");
        } catch (error) {
          console.error("DeviceMotion permission request failed:", error);
          setPermissionGranted(false);
        }
      } else {
        // `requestPermission` が不要な環境（Android など）
        setPermissionGranted(true);
      }
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration) {
        setAcceleration({
          x: event.acceleration.x ?? 0,
          y: event.acceleration.y ?? 0,
          z: event.acceleration.z ?? 0,
        });
      }
    };

    if (permissionGranted === true) {
      window.addEventListener("devicemotion", handleMotion);
    } else if (permissionGranted === null) {
      requestPermission();
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [permissionGranted]);

  return { acceleration, permissionGranted };
};

export default useMotion;
