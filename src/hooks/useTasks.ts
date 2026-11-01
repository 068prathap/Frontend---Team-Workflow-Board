import { useCallback, useEffect, useState } from "react";
import type { Status, StoredBoard, Task, TaskFormData } from "@/types/task";

const storageKey = "taskBoard";

function toTags(tags: string) {
  return tags.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "");
}

export function useTasks() {
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    try {
      const taskBoard: Task[] | StoredBoard | null = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (taskBoard) {
        if (Array.isArray(taskBoard)) {
          setTaskList(taskBoard);
          setMigrated(true);
        } else {
          setTaskList(taskBoard.tasks);
        }
      }
      setCanSave(true);
    } catch {
      setStorageError("Could not load your saved tasks. Changes you make now will not be saved.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!canSave) return;
    try {
      const taskBoard: StoredBoard = { schemaVersion: 2, tasks: taskList };
      localStorage.setItem(storageKey, JSON.stringify(taskBoard));
    } catch {
      setStorageError("Could not save your tasks. Browser storage may be full or blocked.");
    }
  }, [taskList, canSave]);

  const addTask = useCallback((formData: TaskFormData) => {
    const now = new Date().toISOString();
    setTaskList((prev) => [
      ...prev,
      { ...formData, id: crypto.randomUUID(), tags: toTags(formData.tags), createdAt: now, updatedAt: now },
    ]);
  }, []);

  const updateTask = useCallback((taskId: string, formData: TaskFormData) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...formData, tags: toTags(formData.tags), updatedAt: new Date().toISOString() }
          : task
      )
    );
  }, []);

  const changeStatus = useCallback((taskId: string, status: Status) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTaskList((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  return { taskList, loaded, migrated, storageError, addTask, updateTask, changeStatus, deleteTask };
}
