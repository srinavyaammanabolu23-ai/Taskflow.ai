import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../contexts/TaskContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Header({ onMenuClick, searchQuery, onSearchChange }: HeaderProps) {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="header-greeting">
          <h2>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
          <p>{formatDate()}</p>
        </div>
      </div>
      <div className="header-right">
        <div className="header-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            id="header-search-input"
          />
        </div>
        <NotificationBell tasks={tasks} />
        <div className="header-avatar" style={{ background: user?.avatarColor || '#34d399' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
