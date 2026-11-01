"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useFilters } from "@/hooks/useFilters";
import { useTasks } from "@/hooks/useTasks";
import { statusList, type Status, type Task, type TaskFormData } from "@/types/task";
import { filterTasks } from "@/utils/filterTasks";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { Column } from "./Column";
import { FilterBar } from "./FilterBar";
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
  const { taskList, loaded, migrated, storageError, addTask, updateTask, changeStatus, deleteTask } = useTasks();
  const { filters, updateFilters, clearFilters, isFiltered } = useFilters();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(emptyForm);
  const [initialForm, setInitialForm] = useState<TaskFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleError, setTitleError] = useState("");
  const [message, setMessage] = useState("");

  const isDirty = showForm && JSON.stringify(formData) !== JSON.stringify(initialForm);
  const clearMessage = useCallback(() => setMessage(""), []);

  const visibleTasks = useMemo(() => filterTasks(taskList, filters), [taskList, filters]);
  const visibleStatuses = filters.status.length > 0 ? statusList.filter((status) => filters.status.includes(status)) : statusList;
  const tasksByStatus = useMemo(() => {
    const groups: Record<Status, Task[]> = { Backlog: [], "In Progress": [], Done: [] };
    visibleTasks.forEach((task) => groups[task.status].push(task));
    return groups;
  }, [visibleTasks]);

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

  const openForm = useCallback((task?: Task) => {
    const values = task ? toFormData(task) : emptyForm;
    setFormData(values);
    setInitialForm(values);
    setEditingId(task ? task.id : null);
    setShowForm(true);
  }, []);

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

  function handleDelete() {
    if (!editingId || !window.confirm("Delete this task? This cannot be undone.")) return;
    deleteTask(editingId);
    setMessage("Task deleted");
    formReset();
  }

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Team Workflow Board</h1>
          <Button onClick={() => openForm()}>Add task</Button>
        </header>

        {storageError && <Alert tone="error">{storageError}</Alert>}

        <FilterBar filters={filters} isFiltered={isFiltered} onChange={updateFilters} onClear={clearFilters} />

        {loaded && taskList.length === 0 && (
          <p className={styles.emptyBoard}>No tasks yet. Click &quot;Add task&quot; to create your first one.</p>
        )}

        {taskList.length > 0 && visibleTasks.length === 0 && (
          <div className={styles.emptyBoard}>
            <p>No tasks match your filters.</p>
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}

        <div className={styles.columns}>
          {visibleStatuses.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
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
            onDelete={editingId ? handleDelete : undefined}
          />
        </Modal>
      )}

      <Toast message={message} onClose={clearMessage} />
    </>
  );
}
