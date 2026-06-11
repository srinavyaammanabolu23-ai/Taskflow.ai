import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import {
  getUsers, saveUsers, findUserByEmail,
  getCurrentUser, setCurrentUser, clearCurrentUser,
  generateId, randomAvatarColor,
} from '../utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getCurrentUser();
    if (stored) setUser(stored);
  }, []);

  const login = (email: string, password: string) => {
    const found = findUserByEmail(email);
    if (!found) return { success: false, error: 'No account found with that email' };
    if (found.password !== password) return { success: false, error: 'Incorrect password' };
    setUser(found);
    setCurrentUser(found);
    return { success: true };
  };

  const register = (name: string, email: string, password: string) => {
    if (findUserByEmail(email)) return { success: false, error: 'Email already registered' };
    const newUser: User = {
      id: generateId(),
      name,
      email,
      password,
      avatarColor: randomAvatarColor(),
      createdAt: new Date().toISOString(),
    };
    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    setUser(newUser);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    clearCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
