export const statusList = ["Backlog", "In Progress", "Done"] as const;
export const priorityList = ["High", "Medium", "Low"] as const;

export type Status = (typeof statusList)[number];
export type Priority = (typeof priorityList)[number];

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskFormData = {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  tags: string;
};

export type StoredBoard = {
  schemaVersion: 2;
  tasks: Task[];
};
