import { useTasks } from '../contexts/TaskContext';
import type { Task } from '../types';

export default function Dashboard() {
  const { tasks, stats } = useTasks();

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

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

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const priorityCounts = {
    urgent: tasks.filter((t: Task) => t.priority === 'urgent').length,
    high: tasks.filter((t: Task) => t.priority === 'high').length,
    medium: tasks.filter((t: Task) => t.priority === 'medium').length,
    low: tasks.filter((t: Task) => t.priority === 'low').length,
  };

  const maxPriority = Math.max(...Object.values(priorityCounts), 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Track your productivity and task progress</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="stat-card stat-progress">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card stat-done">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.done}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="stat-card stat-overdue">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Middle row */}
      <div className="dashboard-row">
        {/* Completion Ring */}
        <div className="dash-card completion-card">
          <h3>Completion Rate</h3>
          <div className="completion-ring">
            <svg viewBox="0 0 120 120" width="140" height="140">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(134,59,255,0.15)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="52"
                fill="none" stroke="url(#completionGrad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${completionRate * 3.267} 326.7`}
                transform="rotate(-90 60 60)"
                className="completion-ring-progress"
              />
              <defs>
                <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#47bfff" />
                </linearGradient>
              </defs>
            </svg>
            <span className="completion-percent">{completionRate}%</span>
          </div>
          <p className="completion-sub">{stats.done} of {stats.total} tasks completed</p>
        </div>

        {/* Priority Breakdown */}
        <div className="dash-card priority-card">
          <h3>Priority Breakdown</h3>
          <div className="priority-bars">
            {Object.entries(priorityCounts).map(([key, count]) => (
              <div className="priority-row" key={key}>
                <span className="priority-label" style={{ color: getPriorityColor(key) }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill"
                    style={{
                      width: `${(count / maxPriority) * 100}%`,
                      background: getPriorityColor(key),
                    }}
                  />
                </div>
                <span className="priority-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="dash-card recent-card">
        <h3>Recent Activity</h3>
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Create your first task from the Board!</p>
          </div>
        ) : (
          <div className="recent-list">
            {recentTasks.map((task) => (
              <div className="recent-item" key={task.id}>
                <div className="recent-priority-dot" style={{ background: getPriorityColor(task.priority) }} />
                <div className="recent-info">
                  <span className="recent-title">{task.title}</span>
                  <span className="recent-meta">
                    <span className={`status-badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
                    <span className="recent-time">{formatDate(task.updatedAt)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
