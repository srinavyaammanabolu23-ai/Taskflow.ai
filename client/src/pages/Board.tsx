import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import TaskColumn from '../components/Tasks/TaskColumn';
import TaskModal from '../components/Tasks/TaskModal';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface LayoutContext {
  searchQuery: string;
}

export default function Board() {
  const { tasks, addTask, updateTask, deleteTask, moveTask } = useTasks();
  const { searchQuery } = useOutletContext<LayoutContext>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');

  const filtered = searchQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  const columns: { status: TaskStatus; title: string }[] = [
    { status: 'todo', title: 'To Do' },
    { status: 'in-progress', title: 'In Progress' },
    { status: 'done', title: 'Done' },
  ];

  const handleAddClick = (status: TaskStatus) => {
    setEditingTask(null);
    setInitialStatus(status);
    setModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
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

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    moveTask(taskId, newStatus);
  };

  return (
    <div className="board-page">
      <div className="board-header">
        <h1>Task Board</h1>
        <button className="btn-primary" onClick={() => handleAddClick('todo')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      <div className="board-columns">
        {columns.map((col) => (
          <TaskColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={filtered.filter((t) => t.status === col.status)}
            onAddClick={() => handleAddClick(col.status)}
            onTaskClick={handleTaskClick}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          initialStatus={initialStatus}
          onSave={handleSave}
          onDelete={editingTask ? handleDelete : undefined}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
