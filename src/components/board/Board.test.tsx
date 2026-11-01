import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Task } from "@/types/task";
import { Board } from "./Board";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: crypto.randomUUID(),
    title: "Task",
    description: "",
    status: "Backlog",
    priority: "Medium",
    assignee: "",
    tags: [],
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
    ...overrides,
  };
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem("taskBoard", JSON.stringify({ schemaVersion: 2, tasks }));
}

function column(name: string) {
  return screen.getByRole("region", { name });
}

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  jest.restoreAllMocks();
});

test("creates a task and shows it on the board", async () => {
  const user = userEvent.setup();
  render(<Board />);

  await user.click(screen.getByRole("button", { name: "Add task" }));
  const dialog = screen.getByRole("dialog", { name: "New task" });
  expect(within(dialog).getByLabelText(/Title/)).toHaveFocus();

  await user.click(within(dialog).getByRole("button", { name: "Create task" }));
  expect(within(dialog).getByRole("alert")).toHaveTextContent("Title is required");

  await user.type(within(dialog).getByLabelText(/Title/), "Fix login bug");
  await user.type(within(dialog).getByLabelText("Tags"), "bug, auth");
  await user.click(within(dialog).getByRole("button", { name: "Create task" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  const backlog = column("Backlog");
  expect(within(backlog).getByRole("heading", { name: "Fix login bug" })).toBeInTheDocument();
  expect(within(backlog).getByText("bug")).toBeInTheDocument();
  expect(within(backlog).getByText("auth")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Task created");

  const saved = JSON.parse(localStorage.getItem("taskBoard") ?? "{}");
  expect(saved.schemaVersion).toBe(2);
  expect(saved.tasks[0].title).toBe("Fix login bug");
});

test("moves a task to another column when its status changes", async () => {
  const user = userEvent.setup();
  saveTasks([makeTask({ title: "Write docs" })]);
  render(<Board />);

  await user.selectOptions(await screen.findByLabelText("Status of Write docs"), "Done");

  expect(within(column("Backlog")).queryByText("Write docs")).not.toBeInTheDocument();
  expect(within(column("Done")).getByText("Write docs")).toBeInTheDocument();
});

test("filters by search text and keeps the filter in the URL", async () => {
  const user = userEvent.setup();
  saveTasks([
    makeTask({ title: "Design login page" }),
    makeTask({ title: "Set up API client", description: "Helper for login calls" }),
    makeTask({ title: "Write docs" }),
  ]);
  render(<Board />);
  await screen.findByText("Write docs");

  await user.type(screen.getByLabelText("Search"), "login");

  expect(screen.getByText("Design login page")).toBeInTheDocument();
  expect(screen.getByText("Set up API client")).toBeInTheDocument();
  expect(screen.queryByText("Write docs")).not.toBeInTheDocument();
  expect(window.location.search).toBe("?q=login");

  await user.clear(screen.getByLabelText("Search"));
  await user.type(screen.getByLabelText("Search"), "nothing matches");
  expect(screen.getByText("No tasks match your filters.")).toBeInTheDocument();
});

test("restores filters from the URL on load", async () => {
  window.history.replaceState(null, "", "/?priority=High&status=Backlog");
  saveTasks([
    makeTask({ title: "Urgent backlog task", priority: "High" }),
    makeTask({ title: "Normal backlog task", priority: "Low" }),
    makeTask({ title: "Urgent done task", priority: "High", status: "Done" }),
  ]);
  render(<Board />);

  expect(await screen.findByText("Urgent backlog task")).toBeInTheDocument();
  expect(screen.queryByText("Normal backlog task")).not.toBeInTheDocument();
  expect(screen.queryByText("Urgent done task")).not.toBeInTheDocument();
  expect(screen.queryByRole("region", { name: "Done" })).not.toBeInTheDocument();
  expect(screen.getByLabelText("Priority")).toHaveValue("High");
});

test("asks before discarding unsaved changes", async () => {
  const user = userEvent.setup();
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
  saveTasks([makeTask({ title: "Write docs" })]);
  render(<Board />);

  await user.click(await screen.findByRole("button", { name: "Edit Write docs" }));
  await user.type(screen.getByLabelText(/Title/), " today");
  await user.keyboard("{Escape}");

  expect(confirm).toHaveBeenCalledWith("Discard unsaved changes?");
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  confirm.mockReturnValue(true);
  await user.click(screen.getByRole("button", { name: "Cancel" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("Write docs")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Edit Write docs" })).toHaveFocus();
});
