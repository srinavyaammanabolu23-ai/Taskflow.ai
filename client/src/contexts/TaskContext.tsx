import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { useAuth } from './AuthContext';

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  urgent: number;
}

interface TaskContextType {
  tasks: Task[];
  stats: TaskStats;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>;
  getFilteredTasks: (status?: TaskStatus, priority?: TaskPriority, search?: string) => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);
const API_URL = 'http://localhost:5000/api';

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }
    try {
      const token = localStorage.getItem('taskflow_token');
      const res = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('taskflow_token');
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
      }
    } catch (err) {
      console.error('Failed to add task', err);
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Optimistic update for UI snap
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    
    try {
      const token = localStorage.getItem('taskflow_token');
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(updates)
      });
      if (!res.ok) {
        // Rollback on failure could be implemented here, 
        // for now we just refetch to ensure sync
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to update task', err);
      fetchTasks();
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id));
    
    try {
      const token = localStorage.getItem('taskflow_token');
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to delete task', err);
      fetchTasks();
    }
  }, [fetchTasks]);

  const moveTask = useCallback(async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
  }, [updateTask]);

  const getFilteredTasks = useCallback((status?: TaskStatus, priority?: TaskPriority, search?: string) => {
    let filtered = [...tasks];
    if (status) filtered = filtered.filter((t) => t.status === status);
    if (priority) filtered = filtered.filter((t) => t.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [tasks]);

  const stats: TaskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
  };

  return (
    <TaskContext.Provider value={{ tasks, stats, addTask, updateTask, deleteTask, moveTask, getFilteredTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
