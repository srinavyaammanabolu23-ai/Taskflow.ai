import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types';

interface Notification {
  id: string;
  type: 'urgent' | 'overdue' | 'due-today' | 'due-soon' | 'high-priority';
  title: string;
  message: string;
  taskId: string;
  timestamp: Date;
  read: boolean;
  icon: string;
  color: string;
}

interface NotificationBellProps {
  tasks: Task[];
}

function generateNotifications(tasks: Task[]): Notification[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysOut = new Date(today);
  threeDaysOut.setDate(threeDaysOut.getDate() + 3);

  const notifications: Notification[] = [];

  for (const task of tasks) {
    if (task.status === 'done') continue;

    const dueDate = task.dueDate ? new Date(task.dueDate) : null;

    // Urgent priority tasks always get a notification
    if (task.priority === 'urgent') {
      notifications.push({
        id: `urgent-${task.id}`,
        type: 'urgent',
        title: '🚨 Urgent Task',
        message: `"${task.title}" is marked as urgent and needs immediate attention.`,
        taskId: task.id,
        timestamp: new Date(task.updatedAt),
        read: false,
        icon: '🚨',
        color: '#ff4757',
      });
    }

    // Overdue tasks
    if (dueDate && dueDate.getTime() < today.getTime() && task.status !== 'done') {
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `overdue-${task.id}`,
        type: 'overdue',
        title: '⏰ Overdue',
        message: `"${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`,
        taskId: task.id,
        timestamp: new Date(task.updatedAt),
        read: false,
        icon: '⏰',
        color: '#ff4757',
      });
    }

    // Due today
    if (dueDate && dueDate.getTime() === today.getTime()) {
      notifications.push({
        id: `today-${task.id}`,
        type: 'due-today',
        title: '📅 Due Today',
        message: `"${task.title}" is due today. Don't forget to complete it!`,
        taskId: task.id,
        timestamp: new Date(task.updatedAt),
        read: false,
        icon: '📅',
        color: '#ffa726',
      });
    }

    // Due within 3 days (not today, not overdue)
    if (dueDate && dueDate > today && dueDate <= threeDaysOut) {
      const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      notifications.push({
        id: `soon-${task.id}`,
        type: 'due-soon',
        title: '📋 Due Soon',
        message: `"${task.title}" is due in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`,
        taskId: task.id,
        timestamp: new Date(task.updatedAt),
        read: false,
        icon: '📋',
        color: '#42a5f5',
      });
    }

    // High priority tasks (not urgent, those are handled above)
    if (task.priority === 'high') {
      notifications.push({
        id: `high-${task.id}`,
        type: 'high-priority',
        title: '🔥 High Priority',
        message: `"${task.title}" is high priority — keep it on your radar.`,
        taskId: task.id,
        timestamp: new Date(task.updatedAt),
        read: false,
        icon: '🔥',
        color: '#ff6b35',
      });
    }
  }

  // Sort: urgent/overdue first, then due-today, then due-soon, then high-priority
  const typeOrder: Record<string, number> = {
    urgent: 0,
    overdue: 1,
    'due-today': 2,
    'due-soon': 3,
    'high-priority': 4,
  };

  notifications.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  return notifications;
}

export default function NotificationBell({ tasks }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('taskflow_dismissed_notifs');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const allNotifications = generateNotifications(tasks);
  const activeNotifications = allNotifications.filter((n) => !dismissed.has(n.id));
  const unreadCount = activeNotifications.length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const dismissNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem('taskflow_dismissed_notifs', JSON.stringify([...next]));
  };

  const dismissAll = () => {
    const next = new Set([...dismissed, ...activeNotifications.map((n) => n.id)]);
    setDismissed(next);
    localStorage.setItem('taskflow_dismissed_notifs', JSON.stringify([...next]));
  };

  const handleNotifClick = () => {
    setOpen(false);
    navigate('/board');
  };

  const getTimeSince = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        className={`notif-bell ${unreadCount > 0 ? 'has-notifs' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={`Notifications (${unreadCount} unread)`}
        id="notification-bell"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <h3>Notifications</h3>
            <div className="notif-header-actions">
              {activeNotifications.length > 0 && (
                <button className="notif-clear-all" onClick={dismissAll}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="notif-list">
            {activeNotifications.length === 0 ? (
              <div className="notif-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p>You're all caught up!</p>
                <span>No pending notifications</span>
              </div>
            ) : (
              activeNotifications.map((notif) => (
                <div
                  className={`notif-item notif-type-${notif.type}`}
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notif-item-accent" style={{ background: notif.color }} />
                  <div className="notif-item-icon">{notif.icon}</div>
                  <div className="notif-item-content">
                    <span className="notif-item-title">{notif.title}</span>
                    <p className="notif-item-message">{notif.message}</p>
                    <span className="notif-item-time">{getTimeSince(notif.timestamp)}</span>
                  </div>
                  <button
                    className="notif-dismiss"
                    onClick={(e) => dismissNotif(notif.id, e)}
                    aria-label="Dismiss notification"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {activeNotifications.length > 0 && (
            <div className="notif-dropdown-footer">
              <div className="notif-summary">
                {allNotifications.filter((n) => n.type === 'urgent' || n.type === 'overdue').length > 0 && (
                  <span className="notif-summary-item notif-summary-critical">
                    {allNotifications.filter((n) => (n.type === 'urgent' || n.type === 'overdue') && !dismissed.has(n.id)).length} critical
                  </span>
                )}
                <span className="notif-summary-item">
                  {activeNotifications.length} total
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
