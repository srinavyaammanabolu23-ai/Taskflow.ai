import { useState } from 'react';
import type { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onAddClick: () => void;
  onTaskClick: (task: Task) => void;
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskColumn({ status, title, tasks, onAddClick, onTaskClick, onDrop }: TaskColumnProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onDrop(taskId, status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getColumnAccent = () => {
    switch (status) {
      case 'todo': return '#ffa726';
      case 'in-progress': return '#42a5f5';
      case 'done': return '#66bb6a';
      default: return '#34d399';
    }
  };

  return (
    <div
      className={`task-column ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="column-dot" style={{ background: getColumnAccent() }} />
          <h3>{title}</h3>
          <span className="column-count">{tasks.length}</span>
        </div>
        <button className="column-add" onClick={onAddClick} aria-label={`Add task to ${title}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div className="column-tasks">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={handleDragStart}
          />
        ))}
        {tasks.length === 0 && (
          <div className="column-empty">
            <p>No tasks here</p>
            <button onClick={onAddClick}>+ Add a task</button>
          </div>
        )}
      </div>
    </div>
  );
}
