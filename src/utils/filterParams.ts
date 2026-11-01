import { defaultFilters, sortOptions, type Filters, type SortKey } from "@/types/filters";
import { priorityList, statusList, type Priority, type Status } from "@/types/task";

function isStatus(value: string): value is Status {
  return statusList.includes(value as Status);
}

function isPriority(value: string | null): value is Priority {
  return priorityList.includes(value as Priority);
}

function isSortKey(value: string | null): value is SortKey {
  return sortOptions.some((option) => option.value === value);
}

export function readFilters(query: string): Filters {
  const params = new URLSearchParams(query);
  const priority = params.get("priority");
  const sort = params.get("sort");

  return {
    status: (params.get("status")?.split(",") ?? []).filter(isStatus),
    priority: isPriority(priority) ? priority : defaultFilters.priority,
    search: params.get("q") ?? "",
    sort: isSortKey(sort) ? sort : defaultFilters.sort,
  };
}

export function writeFilters(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.status.length > 0) params.set("status", filters.status.join(","));
  if (filters.priority !== defaultFilters.priority) params.set("priority", filters.priority);
  if (filters.search !== "") params.set("q", filters.search);
  if (filters.sort !== defaultFilters.sort) params.set("sort", filters.sort);
  return params.toString();
}
