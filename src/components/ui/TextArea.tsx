import { useId, type TextareaHTMLAttributes } from "react";
import { Field } from "./Field";
import styles from "./ui.module.css";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextArea({ label, error, ...props }: TextAreaProps) {
  const id = useId();
  return (
    <Field id={id} label={label} error={error}>
      <textarea
        id={id}
        rows={4}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </Field>
  );
}
