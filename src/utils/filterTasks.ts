import type { Filters } from "@/types/filters";
import type { Priority, Task } from "@/types/task";

const priorityRank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function filterTasks(tasks: Task[], filters: Filters) {
  const search = filters.search.trim().toLowerCase();

  return tasks
    .filter((task) => filters.status.length === 0 || filters.status.includes(task.status))
    .filter((task) => filters.priority === "All" || task.priority === filters.priority)
    .filter(
      (task) =>
        search === "" ||
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search)
    )
    .sort((a, b) => {
      if (filters.sort === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
      const key = filters.sort === "updated" ? "updatedAt" : "createdAt";
      return b[key].localeCompare(a[key]);
    });
}
