import { useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../../types';

interface TaskModalProps {
  task?: Task | null;
  initialStatus?: TaskStatus;
  onSave: (data: { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDate: string; tags: string[] }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function TaskModal({ task, initialStatus, onSave, onDelete, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || initialStatus || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), status, priority, dueDate, tags });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-tags">Tags</label>
            <div className="tag-input-wrap">
              <div className="tag-list">
                {tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                    <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>×</button>
                  </span>
                ))}
              </div>
              <input
                id="task-tags"
                type="text"
                placeholder="Add tag & press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          <div className="modal-actions">
            {task && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="delete-confirm">
                    <span>Are you sure?</span>
                    <button type="button" className="btn-danger" onClick={onDelete}>Yes, Delete</button>
                    <button type="button" className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  </div>
                ) : (
                  <button type="button" className="btn-danger-outline" onClick={() => setShowDeleteConfirm(true)}>
                    Delete
                  </button>
                )}
              </>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">{task ? 'Save Changes' : 'Create Task'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
