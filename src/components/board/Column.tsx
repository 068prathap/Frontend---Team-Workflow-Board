import { useId } from "react";
import type { Status, Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import styles from "./board.module.css";

type ColumnProps = {
  status: Status;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (taskId: string, status: Status) => void;
};

export function Column({ status, tasks, onEdit, onStatusChange }: ColumnProps) {
  const headingId = useId();

  return (
    <section className={styles.column} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.columnTitle}>
        {status}
        <span className={styles.count} aria-hidden="true">{tasks.length}</span>
      </h2>
      {tasks.length === 0 ? (
        <p className={styles.emptyColumn}>No tasks</p>
      ) : (
        <ul className={styles.taskList}>
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} onEdit={onEdit} onStatusChange={onStatusChange} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
