import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { getTasks, getAllTasks, saveTasks, generateId } from '../utils/storage';
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
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  getFilteredTasks: (status?: TaskStatus, priority?: TaskPriority, search?: string) => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      setTasks(getTasks(user.id));
    } else {
      setTasks([]);
    }
  }, [user]);

  const persist = useCallback((updated: Task[]) => {
    // Merge with other users' tasks
    const all = getAllTasks();
    const otherTasks = all.filter((t) => t.userId !== user?.id);
    saveTasks([...otherTasks, ...updated]);
    setTasks(updated);
  }, [user]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      userId: user.id,
    };
    const updated = [...tasks, newTask];
    persist(updated);
  }, [user, tasks, persist]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    persist(updated);
  }, [tasks, persist]);

  const deleteTask = useCallback((id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    persist(updated);
  }, [tasks, persist]);

  const moveTask = useCallback((id: string, newStatus: TaskStatus) => {
    updateTask(id, { status: newStatus });
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
