import type { ReactNode } from "react";
import styles from "./ui.module.css";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hideLabel?: boolean;
  children: ReactNode;
};

export function Field({ id, label, error, required, hideLabel, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={hideLabel ? styles.visuallyHidden : styles.label}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
