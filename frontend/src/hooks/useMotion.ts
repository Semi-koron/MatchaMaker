import { useState, useEffect } from "react";

const requestPermission = async () => {
  // @ts-expect-error only safari property
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    try {
      // @ts-expect-error only safari property
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState !== "granted") {
        console.warn("Device Motion permission denied.");
      }
    } catch (error) {
      console.error("Error requesting Device Motion permission:", error);
    }
  }
};

const useMotion = () => {
  const [acceleration, setAcceleration] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  useEffect(() => {
    const handleMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration) {
        setAcceleration({
          x: event.acceleration.x ?? 0,
          y: event.acceleration.y ?? 0,
          z: event.acceleration.z ?? 0,
        });
      }
    };

    requestPermission();

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);

  return acceleration;
};

export default useMotion;
