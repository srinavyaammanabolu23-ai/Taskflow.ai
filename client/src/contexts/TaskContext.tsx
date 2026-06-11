import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ref, onValue, push, update, remove, set } from 'firebase/database';
import { db } from '../firebase';
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

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    // Subscribe to tasks in Realtime Database under this user's node
    const tasksRef = ref(db, `tasks/${user.id}`);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTasks = Object.keys(data).map(key => ({
          ...data[key],
          id: key, // Use Firebase generated key as ID
          tags: data[key].tags || [] // Ensure tags is always an array
        }));
        setTasks(loadedTasks);
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const now = new Date().toISOString();
      const newTask = {
        ...taskData,
        tags: taskData.tags || [],
        userId: user.id,
        createdAt: now,
        updatedAt: now,
      };
      
      const tasksRef = ref(db, `tasks/${user.id}`);
      const newTaskRef = push(tasksRef);
      await set(newTaskRef, newTask);
      
    } catch (err) {
      console.error('Failed to add task', err);
    }
  }, [user]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    try {
      const taskRef = ref(db, `tasks/${user.id}/${id}`);
      await update(taskRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update task', err);
    }
  }, [user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;
    try {
      const taskRef = ref(db, `tasks/${user.id}/${id}`);
      await remove(taskRef);
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  }, [user]);

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
