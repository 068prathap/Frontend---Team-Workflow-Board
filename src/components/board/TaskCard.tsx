import { memo } from "react";
import { statusList, type Priority, type Status, type Task } from "@/types/task";
import { relativeTime } from "@/utils/relativeTime";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Tag } from "@/components/ui/Tag";
import styles from "./board.module.css";

const priorityTone: Record<Priority, "red" | "amber" | "green"> = {
  High: "red",
  Medium: "amber",
  Low: "green",
};

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, status: Status) => void;
};

export const TaskCard = memo(function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
  return (
    <Card className={styles.taskCard}>
      <h3 className={styles.taskTitle}>{task.title}</h3>

      <div className={styles.meta}>
        <Tag tone={priorityTone[task.priority]}>{task.priority}</Tag>
        <span className={styles.assignee}>{task.assignee || "Unassigned"}</span>
      </div>

      {task.tags.length > 0 && (
        <ul className={styles.tags} aria-label="Tags">
          {task.tags.map((tag, index) => (
            <li key={`${tag}-${index}`}>
              <Tag>{tag}</Tag>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.updated}>
        Updated{" "}
        <time dateTime={task.updatedAt} title={new Date(task.updatedAt).toLocaleString()}>
          {relativeTime(task.updatedAt)}
        </time>
      </p>

      <div className={styles.cardActions}>
        <Select
          label={`Status of ${task.title}`}
          hideLabel
          options={statusList}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Status)}
        />
        <Button variant="secondary" size="sm" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
          Edit
        </Button>
      </div>
    </Card>
  );
});
