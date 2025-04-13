import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { useEffect, useState } from "react";

export const useQrScanner = (onSuccess: (text: string) => Promise<void>) => {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    setScanner(html5QrCode);

    Html5Qrcode.getCameras()
      .then((devices) =>
        setCameras(
          devices.map((device) => ({
            deviceId: device.id,
            label: device.label,
            kind: "videoinput",
            groupId: "",
            toJSON: () => ({
              deviceId: device.id,
              label: device.label,
              kind: "videoinput",
              groupId: "",
            }),
          }))
        )
      )
      .catch((err) => console.error("Camera error:", err));

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  const startScan = async (cameraId?: string) => {
    if (!scanner) return;

    setIsScanning(true);
    setError(null);

    try {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      };

      await scanner.start(
        cameraId || { facingMode: "environment" },
        config,
        async (decodedText) => {
          await scanner.stop();
          setIsScanning(false);
          await onSuccess(decodedText);
        },
        (errorMessage) => {
          setError(errorMessage);
          setIsScanning(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scanner");
      setIsScanning(false);
    }
  };

  const stopScan = async () => {
    if (scanner?.isScanning) {
      await scanner.stop();
      setIsScanning(false);
    }
  };

  return { startScan, stopScan, isScanning, error, cameras };
};
