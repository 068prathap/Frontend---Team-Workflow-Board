import { useId, type SelectHTMLAttributes } from "react";
import { Field } from "./Field";
import styles from "./ui.module.css";

type Option = string | { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly Option[];
  hideLabel?: boolean;
};

export function Select({ label, options, hideLabel, ...props }: SelectProps) {
  const id = useId();
  return (
    <Field id={id} label={label} hideLabel={hideLabel}>
      <select id={id} className={styles.input} {...props}>
        {options.map((option) => {
          const { value, label: text } = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </Field>
  );
}
