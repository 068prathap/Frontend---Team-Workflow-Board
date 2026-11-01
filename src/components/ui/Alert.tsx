import type { ReactNode } from "react";
import styles from "./ui.module.css";

type AlertProps = {
  tone?: "error" | "info";
  children: ReactNode;
};

export function Alert({ tone = "info", children }: AlertProps) {
  return (
    <div className={`${styles.alert} ${tone === "error" ? styles.alertError : styles.alertInfo}`} role="alert">
      {children}
    </div>
  );
}
