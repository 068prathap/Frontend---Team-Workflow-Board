import type { ReactNode } from "react";
import styles from "./ui.module.css";

type TagProps = {
  tone?: "neutral" | "red" | "amber" | "green";
  children: ReactNode;
};

export function Tag({ tone = "neutral", children }: TagProps) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>;
}
