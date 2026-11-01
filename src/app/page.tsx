"use client";
import styles from "./page.module.css";

const tasks = [
  {
    id: "1",
    title: "Design login page",
    description: "Create the layout for the login page.\nInclude email and password fields.",
    status: "Backlog",
    priority: "High",
    assignee: "Prathap",
    tags: ["design", "auth"],
    createdAt: "2026-10-28T10:00:00.000Z",
    updatedAt: "2026-10-30T09:30:00.000Z",
  },
  {
    id: "2",
    title: "Set up API client",
    description: "Add a helper to call the backend APIs.",
    status: "In Progress",
    priority: "Medium",
    assignee: "Ravi",
    tags: ["setup"],
    createdAt: "2026-10-29T08:15:00.000Z",
    updatedAt: "2026-10-31T14:00:00.000Z",
  },
  {
    id: "3",
    title: "Fix navbar on mobile",
    description: "Menu items overlap on small screens.",
    status: "In Progress",
    priority: "Low",
    assignee: "Divya",
    tags: ["bug", "mobile"],
    createdAt: "2026-10-30T11:45:00.000Z",
    updatedAt: "2026-11-01T07:20:00.000Z",
  },
  {
    id: "4",
    title: "Write onboarding docs",
    description: "Steps for new developers to run the project.",
    status: "Done",
    priority: "Low",
    assignee: "Prathap",
    tags: ["docs"],
    createdAt: "2026-10-25T09:00:00.000Z",
    updatedAt: "2026-10-27T16:10:00.000Z",
  },
];

const statusList = ["Backlog", "In Progress", "Done"]

export default function Home() {
  function filterTasks(status) {
    return tasks.filter((task)=>{
      return task.status === status;
    })
  }

  return (
    <>
      <main className={styles.page}>
        <h1>Team Workflow Board</h1>
        <div className={styles.taskTable}>
          {
            statusList.map((status)=>(
              <div key={status} className={styles.column}>
                <p>{status}</p>
                {
                  filterTasks(status).map((task)=>(
                    <div key={task.id} className={styles.taskBox}>
                      <p>Title: {task.title}</p>
                      <p>Priority: {task.priority}</p>
                      <p>assignee: {task.assignee}</p>
                      <div className={styles.tagList}>
                        {
                          task.tags.map((tag, index)=>(
                            <p key={index} className={styles.tag}>{tag}</p>
                          ))
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>
      </main>
    </>
  );
}
