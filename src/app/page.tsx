"use client";
import { useState } from "react";
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

const statusList = ["Backlog", "In Progress", "Done"];
const priorityList = ["High", "Medium", "Low"];

const emptyForm = { title: "", description: "", status: "Backlog", priority: "High", assignee:"", tags: "" };

export default function Home() {
  const [taskList, setTaskList] = useState(tasks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm })
  const [formTitleError, setFormTitleError] = useState(false);

  function filterTasks(status) {
    return taskList.filter((task)=>{
      return task.status === status;
    })
  }

  function changeTaskList(newStatus, taskId) {
    setTaskList((prevTaskList) => prevTaskList.map((task)=>{
      if(task.id === taskId) {
        return {... task, status: newStatus, updatedAt: new Date().toISOString()};
      } else {
        return task;
      }
    }))
  }

  function addTask(e) {
    e.preventDefault()
    if(!formData.title.trim()) {
      setFormTitleError(true);
      return;
    }
    const newTags = formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "");
    setTaskList((prev) => [...prev, {...formData, id: crypto.randomUUID(), tags: newTags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}]);
    setShowForm(false);
    formReset();
  }

  function formReset() {
    setFormData({ ...emptyForm });
    setFormTitleError(false);
  }

  return (
    <>
      <main className={styles.page}>
        <h1>Team Workflow Board</h1>
        <div className={styles.addButtonWrap}>
          <button onClick={()=>{setShowForm(true)}}>Add task</button>
        </div>
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
                      {
                        task.assignee && <p>assignee: {task.assignee}</p>
                      }
                      <div className={styles.tagList}>
                        {
                          task.tags.map((tag, index)=>(
                            <p key={index} className={styles.tag}>{tag}</p>
                          ))
                        }
                      </div>
                      <p>change status:</p>
                      <select value={task.status} onChange={(e)=>{changeTaskList(e.target.value, task.id)}}>
                        {
                          statusList.map((option)=>(
                            <option key={option} value={option}>{option}</option>
                          ))
                        }
                      </select>
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>

        {
          showForm && 
          <div className={styles.formPopup}>
            <div className={styles.formPopupCloseWrap}>
              <button onClick={()=>{setShowForm(false); formReset()}}>close</button>
            </div>
            <form onSubmit={addTask} className={styles.form}>
              <p>Title</p>
              <input type="text" value={formData.title} onChange={(e)=>{setFormData({...formData, title: e.target.value}); setFormTitleError(false)}} />
              {
                formTitleError && <p>Title is required</p>
              }

              <p>description</p>
              <textarea value={formData.description} onChange={(e)=>{setFormData({...formData, description: e.target.value})}} />
              
              <p>status</p>
              <select value={formData.status} onChange={(e)=>{setFormData({...formData, status: e.target.value})}}>
                {
                  statusList.map((status) =>(
                    <option key={status} value={status}>{status}</option>
                  ))
                }
              </select>

              <p>priority</p>
              <select value={formData.priority} onChange={(e)=>{setFormData({...formData, priority: e.target.value})}}>
                {
                  priorityList.map((priority) =>(
                    <option key={priority} value={priority}>{priority}</option>
                  ))
                }
              </select>

              <p>assignee</p>
              <input type="text" value={formData.assignee} onChange={(e)=>{setFormData({...formData, assignee: e.target.value})}} />

              <p>tags</p>
              <input type="text" placeholder="eg: bug, mobile" value={formData.tags} onChange={(e)=>{setFormData({...formData, tags: e.target.value})}} />

              <button type="submit">Submit</button>
            </form>
          </div>
        }
      </main>
    </>
  );
}
