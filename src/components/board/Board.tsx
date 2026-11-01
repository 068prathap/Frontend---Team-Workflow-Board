"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTasks } from "@/hooks/useTasks";
import { statusList, type Task, type TaskFormData } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { Column } from "./Column";
import { TaskForm } from "./TaskForm";
import styles from "./board.module.css";

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  status: "Backlog",
  priority: "High",
  assignee: "",
  tags: "",
};

function toFormData(task: Task): TaskFormData {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    tags: task.tags.join(", "),
  };
}

export function Board() {
  const { taskList, loaded, migrated, addTask, updateTask, changeStatus } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [initialForm, setInitialForm] = useState<TaskFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleError, setTitleError] = useState("");
  const [message, setMessage] = useState("");

  const isDirty = showForm && JSON.stringify(formData) !== JSON.stringify(initialForm);
  const clearMessage = useCallback(() => setMessage(""), []);

  useEffect(() => {
    if (migrated) setMessage("Your saved tasks were updated to the new format");
  }, [migrated]);

  useEffect(() => {
    if (!isDirty) return;
    function warnBeforeLeaving(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  function openForm(task?: Task) {
    const values = task ? toFormData(task) : emptyForm;
    setFormData(values);
    setInitialForm(values);
    setEditingId(task ? task.id : null);
    setShowForm(true);
  }

  function formReset() {
    setShowForm(false);
    setFormData(emptyForm);
    setInitialForm(emptyForm);
    setEditingId(null);
    setTitleError("");
  }

  function closeForm() {
    if (isDirty && !window.confirm("Discard unsaved changes?")) return;
    formReset();
  }

  function handleChange<K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    if (editingId) {
      updateTask(editingId, formData);
      setMessage("Task updated");
    } else {
      addTask(formData);
      setMessage("Task created");
    }
    formReset();
  }

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Team Workflow Board</h1>
          <Button onClick={() => openForm()}>Add task</Button>
        </header>

        {loaded && taskList.length === 0 && (
          <p className={styles.emptyBoard}>No tasks yet. Click &quot;Add task&quot; to create your first one.</p>
        )}

        <div className={styles.columns}>
          {statusList.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={taskList.filter((task) => task.status === status)}
              onEdit={openForm}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      </main>

      {showForm && (
        <Modal title={editingId ? "Edit task" : "New task"} onClose={closeForm}>
          <TaskForm
            formData={formData}
            titleError={titleError}
            submitLabel={editingId ? "Save changes" : "Create task"}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}

      <Toast message={message} onClose={clearMessage} />
    </>
  );
}
