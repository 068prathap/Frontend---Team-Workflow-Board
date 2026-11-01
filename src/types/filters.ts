import type { Priority, Status } from "./task";

export const sortOptions = [
  { value: "created", label: "Newest created" },
  { value: "updated", label: "Recently updated" },
  { value: "priority", label: "Priority (high to low)" },
] as const;

export type SortKey = (typeof sortOptions)[number]["value"];

export type Filters = {
  status: Status[];
  priority: Priority | "All";
  search: string;
  sort: SortKey;
};

export const defaultFilters: Filters = {
  status: [],
  priority: "All",
  search: "",
  sort: "created",
};
