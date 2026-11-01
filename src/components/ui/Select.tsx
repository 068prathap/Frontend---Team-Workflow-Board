import { useId, type SelectHTMLAttributes } from "react";
import { Field } from "./Field";
import styles from "./ui.module.css";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly string[];
  hideLabel?: boolean;
};

export function Select({ label, options, hideLabel, ...props }: SelectProps) {
  const id = useId();
  return (
    <Field id={id} label={label} hideLabel={hideLabel}>
      <select id={id} className={styles.input} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}
