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
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        (DeviceMotionEvent as any).requestPermission
      ) {
        try {
          const permission = await (
            DeviceMotionEvent as any
          ).requestPermission();
          setPermissionGranted(permission === "granted");
        } catch (error) {
          console.error("DeviceMotion permission request failed:", error);
          setPermissionGranted(false);
        }
      } else {
        // ブラウザが requestPermission() を必要としない場合
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
