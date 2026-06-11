import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export default function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return '#9ca3af';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const formatDue = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
    >
      <div className="task-card-priority-stripe" style={{ background: getPriorityColor(task.priority) }} />
      <div className="task-card-body">
        <div className="task-card-top">
          <span className={`priority-badge priority-${task.priority}`}>
            {task.priority}
          </span>
          {task.tags.length > 0 && (
            <div className="task-card-tags">
              {task.tags.slice(0, 2).map((t) => (
                <span className="task-tag" key={t}>{t}</span>
              ))}
              {task.tags.length > 2 && <span className="task-tag">+{task.tags.length - 2}</span>}
            </div>
          )}
        </div>
        <h4 className="task-card-title">{task.title}</h4>
        {task.description && (
          <p className="task-card-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}</p>
        )}
        {task.dueDate && (
          <div className={`task-card-due ${isOverdue ? 'overdue' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDue(task.dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}
