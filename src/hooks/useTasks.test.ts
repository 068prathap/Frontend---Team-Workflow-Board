import { renderHook, waitFor } from "@testing-library/react";
import { useTasks } from "./useTasks";

beforeEach(() => localStorage.clear());

test("migrates version 1 data (a plain array) to version 2", async () => {
  localStorage.setItem(
    "taskBoard",
    JSON.stringify([
      {
        id: "1",
        title: "Old task",
        description: "",
        status: "Backlog",
        priority: "Low",
        assignee: "",
        tags: [],
        createdAt: "2026-10-01T10:00:00.000Z",
        updatedAt: "2026-10-01T10:00:00.000Z",
      },
    ])
  );

  const { result } = renderHook(() => useTasks());

  await waitFor(() => expect(result.current.taskList).toHaveLength(1));
  expect(result.current.migrated).toBe(true);
  const saved = JSON.parse(localStorage.getItem("taskBoard") ?? "{}");
  expect(saved).toEqual({ schemaVersion: 2, tasks: [expect.objectContaining({ title: "Old task" })] });
});

test("shows an error and keeps broken saved data untouched", async () => {
  localStorage.setItem("taskBoard", "broken{");

  const { result } = renderHook(() => useTasks());

  await waitFor(() => expect(result.current.storageError).toMatch(/Could not load/));
  expect(localStorage.getItem("taskBoard")).toBe("broken{");
});
