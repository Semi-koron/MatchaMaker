export const requestPermission = async () => {
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
      return false;
    }
  }

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
      return false;
    }
  }

  return true;
};
