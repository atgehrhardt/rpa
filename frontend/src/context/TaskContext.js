import React, { createContext, useState, useContext } from 'react';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [runningTasks, setRunningTasks] = useState([]);

  const addRunningTask = (newTask) => {
    setRunningTasks((prev) => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId, status) => {
    setRunningTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  return (
    <TaskContext.Provider value={{ runningTasks, setRunningTasks, addRunningTask, updateTaskStatus }}>
      {children}
    </TaskContext.Provider>
  );
};