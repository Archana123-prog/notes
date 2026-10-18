import React, { useState, useEffect } from 'react';
import { CloseIcon, PinIcon, CheckIcon, TagIcon } from './Icons';
import { CATEGORIES } from './Sidebar';

export const NOTE_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Slate', value: '#64748b' },
];

export default function NoteModal({
  isOpen,
  onClose,
  onSave,
  initialNote = null,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#6366f1');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setCategory(initialNote.category || 'General');
      setColor(initialNote.color || '#6366f1');
      setIsPinned(Boolean(initialNote.is_pinned));
      setTags(Array.isArray(initialNote.tags) ? initialNote.tags : []);
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
      setColor('#6366f1');
      setIsPinned(false);
      setTags([]);
    }
    setTagInput('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^#/, '');
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        content,
        category,
        color,
        is_pinned: isPinned,
        tags,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-container glass-panel animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          '--modal-accent': color,
        }}
      >
        <div className="modal-accent-bar" style={{ backgroundColor: color }}></div>

        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {initialNote ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Note Title */}
          <div className="form-group">
            <input
              type="text"
              className="modal-title-input"
              placeholder="Note Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Note Content */}
          <div className="form-group">
            <textarea
              className="modal-textarea"
              placeholder="Write your note, ideas, checklists..."
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Category & Pin Option */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">Category</label>
              <select
                className="modal-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pin to Top</label>
              <button
                type="button"
                className={`pin-toggle-btn ${isPinned ? 'active' : ''}`}
                onClick={() => setIsPinned(!isPinned)}
              >
                <PinIcon size={16} filled={isPinned} />
                <span>{isPinned ? 'Pinned' : 'Unpinned'}</span>
              </button>
            </div>
          </div>

          {/* Color Palette Selector */}
          <div className="form-group">
            <label className="form-label">Accent Color</label>
            <div className="color-palette">
              {NOTE_COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  className={`color-swatch ${color === col.value ? 'selected' : ''}`}
                  style={{ backgroundColor: col.value }}
                  onClick={() => setColor(col.value)}
                  title={col.name}
                >
                  {color === col.value && <CheckIcon size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (press Enter or comma)</label>
            <div className="tags-input-wrapper">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip active">
                  <TagIcon size={11} />
                  <span>#{tag}</span>
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="tag-text-input"
                placeholder={tags.length === 0 ? "Add tags like 'design', 'urgent'..." : "Add more..."}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? 'Saving...' : initialNote ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
