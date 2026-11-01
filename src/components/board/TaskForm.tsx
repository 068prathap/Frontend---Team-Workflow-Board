import type { FormEvent } from "react";
import { priorityList, statusList, type Priority, type Status, type TaskFormData } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextArea } from "@/components/ui/TextArea";
import { TextInput } from "@/components/ui/TextInput";
import styles from "./board.module.css";

type TaskFormProps = {
  formData: TaskFormData;
  titleError: string;
  submitLabel: string;
  onChange: <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export function TaskForm({ formData, titleError, submitLabel, onChange, onSubmit, onCancel, onDelete }: TaskFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextInput
        label="Title"
        required
        value={formData.title}
        error={titleError}
        onChange={(e) => onChange("title", e.target.value)}
      />
      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
      />
      <div className={styles.formRow}>
        <Select
          label="Status"
          options={statusList}
          value={formData.status}
          onChange={(e) => onChange("status", e.target.value as Status)}
        />
        <Select
          label="Priority"
          options={priorityList}
          value={formData.priority}
          onChange={(e) => onChange("priority", e.target.value as Priority)}
        />
      </div>
      <TextInput
        label="Assignee"
        value={formData.assignee}
        onChange={(e) => onChange("assignee", e.target.value)}
      />
      <TextInput
        label="Tags"
        placeholder="eg: bug, mobile"
        value={formData.tags}
        onChange={(e) => onChange("tags", e.target.value)}
      />
      <div className={styles.formActions}>
        {onDelete && (
          <Button variant="destructive" className={styles.deleteButton} onClick={onDelete}>
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
