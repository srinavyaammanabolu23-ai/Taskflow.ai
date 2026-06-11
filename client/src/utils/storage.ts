import type { User, Task } from '../types';

const USERS_KEY = 'taskflow_users';
const TASKS_KEY = 'taskflow_tasks';
const CURRENT_USER_KEY = 'taskflow_current_user';

// --- Users ---
export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// --- Current User / Session ---
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// --- Tasks ---
export function getTasks(userId: string): Task[] {
  const data = localStorage.getItem(TASKS_KEY);
  const all: Task[] = data ? JSON.parse(data) : [];
  return all.filter((t) => t.userId === userId);
}

export function getAllTasks(): Task[] {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// --- Helpers ---
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

const AVATAR_COLORS = [
  '#34d399', '#2dd4bf', '#06b6d4', '#f97316',
  '#4caf50', '#ff9800', '#2196f3', '#f44336',
];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
