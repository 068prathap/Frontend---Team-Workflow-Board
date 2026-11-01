import { defaultFilters } from "@/types/filters";
import type { Task } from "@/types/task";
import { filterTasks } from "./filterTasks";

const base: Task = {
  id: "",
  title: "",
  description: "",
  status: "Backlog",
  priority: "Low",
  assignee: "",
  tags: [],
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
};

const tasks: Task[] = [
  { ...base, id: "a", title: "Low old", priority: "Low", createdAt: "2026-10-01T10:00:00.000Z" },
  { ...base, id: "b", title: "High new", priority: "High", status: "Done", createdAt: "2026-10-03T10:00:00.000Z" },
  { ...base, id: "c", title: "Medium mid", priority: "Medium", createdAt: "2026-10-02T10:00:00.000Z", updatedAt: "2026-10-05T10:00:00.000Z" },
];

const ids = (list: Task[]) => list.map((task) => task.id);

test("sorts by created date, updated date and priority", () => {
  expect(ids(filterTasks(tasks, defaultFilters))).toEqual(["b", "c", "a"]);
  expect(ids(filterTasks(tasks, { ...defaultFilters, sort: "updated" }))).toEqual(["c", "a", "b"]);
  expect(ids(filterTasks(tasks, { ...defaultFilters, sort: "priority" }))).toEqual(["b", "c", "a"]);
});

test("combines status, priority and search filters", () => {
  expect(ids(filterTasks(tasks, { ...defaultFilters, status: ["Backlog"] }))).toEqual(["c", "a"]);
  expect(ids(filterTasks(tasks, { ...defaultFilters, status: ["Backlog"], priority: "Low" }))).toEqual(["a"]);
  expect(ids(filterTasks(tasks, { ...defaultFilters, search: "MID" }))).toEqual(["c"]);
});
