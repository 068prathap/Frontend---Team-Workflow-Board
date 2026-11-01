import { useEffect } from "react";
import styles from "./ui.module.css";

type ToastProps = {
  message: string;
  onClose: () => void;
};

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={styles.toastRegion} role="status" aria-live="polite">
      {message && <p className={styles.toast}>{message}</p>}
    </div>
  );
}
