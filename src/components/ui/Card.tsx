import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <article className={`${styles.card} ${className}`} {...props} />;
}
