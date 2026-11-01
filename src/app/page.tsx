"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const statusList = ["Backlog", "In Progress", "Done"];
const priorityList = ["High", "Medium", "Low"];

const emptyForm = { title: "", description: "", status: "Backlog", priority: "High", assignee:"", tags: "" };

export default function Home() {
  const [taskList, setTaskList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm })
  const [formTitleError, setFormTitleError] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [initialForm, setInitialForm] = useState({...emptyForm});
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("")

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
    if(editingId) {
      setTaskList((prev) => prev.map((task) => {
        if(task.id === editingId) {
          return {...task, ...formData, tags: newTags, updatedAt: new Date().toISOString()}
        } else {
          return task;
        }
      }))
    } else {
      setTaskList((prev) => [...prev, {...formData, id: crypto.randomUUID(), tags: newTags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}]);
    }
    setShowForm(false);
    formReset();
  }

  function formReset() {
    setFormData({ ...emptyForm });
    setInitialForm({ ...emptyForm });
    setFormTitleError(false);
    setEditingId(null)
  }

  function editTask(taskId) {
    setEditingId(taskId);
    const task = taskList.find((task)=>task.id === taskId);
    setFormData({...task, tags: task.tags.join(", ")});    
    setInitialForm({...task, tags: task.tags.join(", ")});    
    setShowForm(true);
  }

  function closeForm() {
    if(JSON.stringify(formData) !== JSON.stringify(initialForm)) {
      if(window.confirm("Discard unsaved changes?")) {
        setShowForm(false);
        formReset()
      }
    } else {
      setShowForm(false);
      formReset()
    }
  }

  useEffect(()=>{
    const taskBoard = JSON.parse(localStorage.getItem("taskBoard"));
    if(taskBoard) {
      if (Array.isArray(taskBoard)) {
        setTaskList(taskBoard);
        setMessage("Your saved tasks were updated to the new format")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setTaskList(taskBoard.tasks)
      }
    }
    setLoaded(true);
  }, [])

  useEffect(()=>{
    if (loaded) {
      localStorage.setItem("taskBoard", JSON.stringify({ schemaVersion: 2, tasks: taskList }));
    }
  }, [taskList])

  return (
    <>
      <main className={styles.page}>
        <h1>Team Workflow Board</h1>
        {message && <p>{message}</p>}

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
                      <button onClick={()=>{editTask(task.id)}}>Edit</button>
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
              <button onClick={()=>{closeForm()}}>close</button>
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
