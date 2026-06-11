import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import TaskModal from '../components/Tasks/TaskModal';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface LayoutContext {
  searchQuery: string;
}

export default function TaskList() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { searchQuery } = useOutletContext<LayoutContext>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'dueDate' | 'status'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const statusOrder = { todo: 0, 'in-progress': 1, done: 2 };

  let filtered = [...tasks];
  if (filterStatus) filtered = filtered.filter((t) => t.status === filterStatus);
  if (filterPriority) filtered = filtered.filter((t) => t.priority === filterPriority);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  filtered.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'title': cmp = a.title.localeCompare(b.title); break;
      case 'priority': cmp = priorityOrder[a.priority] - priorityOrder[b.priority]; break;
      case 'dueDate': cmp = (a.dueDate || '').localeCompare(b.dueDate || ''); break;
      case 'status': cmp = statusOrder[a.status] - statusOrder[b.status]; break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleSave = (data: { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDate: string; tags: string[] }) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = () => {
    if (editingTask) {
      deleteTask(editingTask.id);
      setModalOpen(false);
      setEditingTask(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#9ca3af';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className={`sort-icon ${sortBy === col ? 'active' : ''}`}>
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div className="tasklist-page">
      <div className="tasklist-header">
        <h1>All Tasks</h1>
        <button className="btn-primary" onClick={() => { setEditingTask(null); setModalOpen(true); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      <div className="tasklist-filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | '')} id="filter-status">
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | '')} id="filter-priority">
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="filter-count">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state tasklist-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
          </svg>
          <p>No tasks found</p>
          <button className="btn-primary" onClick={() => { setEditingTask(null); setModalOpen(true); }}>Create your first task</button>
        </div>
      ) : (
        <div className="tasklist-table-wrap">
          <table className="tasklist-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')}>Title <SortIcon col="title" /></th>
                <th onClick={() => handleSort('status')}>Status <SortIcon col="status" /></th>
                <th onClick={() => handleSort('priority')}>Priority <SortIcon col="priority" /></th>
                <th onClick={() => handleSort('dueDate')}>Due Date <SortIcon col="dueDate" /></th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id} onClick={() => { setEditingTask(task); setModalOpen(true); }} className="tasklist-row">
                  <td className="tasklist-title-cell">
                    <span className="tasklist-title">{task.title}</span>
                    {task.description && <span className="tasklist-desc">{task.description.slice(0, 50)}</span>}
                  </td>
                  <td><span className={`status-badge status-${task.status}`}>{getStatusLabel(task.status)}</span></td>
                  <td>
                    <span className="priority-dot" style={{ background: getPriorityColor(task.priority) }} />
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </td>
                  <td className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue-text' : ''}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  <td>
                    <div className="tasklist-tags">
                      {task.tags.slice(0, 2).map((t) => <span className="task-tag" key={t}>{t}</span>)}
                      {task.tags.length > 2 && <span className="task-tag">+{task.tags.length - 2}</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onDelete={editingTask ? handleDelete : undefined}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
