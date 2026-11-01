import { useId, type InputHTMLAttributes } from "react";
import { Field } from "./Field";
import styles from "./ui.module.css";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextInput({ label, error, required, ...props }: TextInputProps) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error} required={required}>
      <input
        id={id}
        type="text"
        className={styles.input}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </Field>
  );
}
