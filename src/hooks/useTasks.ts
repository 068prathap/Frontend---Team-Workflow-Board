import { useEffect, useState } from "react";
import type { Status, StoredBoard, Task, TaskFormData } from "@/types/task";

const storageKey = "taskBoard";

function toTags(tags: string) {
  return tags.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "");
}

export function useTasks() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [migrated, setMigrated] = useState(false);

  useEffect(() => {
    const taskBoard: Task[] | StoredBoard | null = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (taskBoard) {
      if (Array.isArray(taskBoard)) {
        setTaskList(taskBoard);
        setMigrated(true);
      } else {
        setTaskList(taskBoard.tasks);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      const taskBoard: StoredBoard = { schemaVersion: 2, tasks: taskList };
      localStorage.setItem(storageKey, JSON.stringify(taskBoard));
    }
  }, [taskList, loaded]);

  function addTask(formData: TaskFormData) {
    const now = new Date().toISOString();
    setTaskList((prev) => [
      ...prev,
      { ...formData, id: crypto.randomUUID(), tags: toTags(formData.tags), createdAt: now, updatedAt: now },
    ]);
  }

  function updateTask(taskId: string, formData: TaskFormData) {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...formData, tags: toTags(formData.tags), updatedAt: new Date().toISOString() }
          : task
      )
    );
  }

  function changeStatus(taskId: string, status: Status) {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task
      )
    );
  }

  return { taskList, loaded, migrated, addTask, updateTask, changeStatus };
}
