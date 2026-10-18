import React from 'react';
import { PinIcon, EditIcon, TrashIcon, TagIcon } from './Icons';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function NoteCard({ note, onEdit, onDelete, onTogglePin }) {
  const cardColor = note.color || '#6366f1';

  return (
    <article
      className={`note-card glass-panel animate-fade-in ${note.is_pinned ? 'is-pinned' : ''}`}
      style={{
        '--card-accent': cardColor,
      }}
    >
      {/* Accent top border strip */}
      <div className="card-accent-bar" style={{ backgroundColor: cardColor }}></div>

      {/* Header: Category Badge & Pin Action */}
      <div className="note-card-header">
        <span className="note-category-pill" style={{ borderColor: `${cardColor}40` }}>
          {note.category || 'General'}
        </span>

        <button
          className={`pin-action-btn ${note.is_pinned ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note.id);
          }}
          title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
        >
          <PinIcon size={16} filled={note.is_pinned} />
        </button>
      </div>

      {/* Body: Title & Content */}
      <div className="note-card-body" onClick={() => onEdit(note)}>
        <h3 className="note-card-title">{note.title}</h3>
        <p className="note-card-content">
          {note.content || <span className="empty-content-text">No additional content</span>}
        </p>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags-list">
          {note.tags.map((tag, idx) => (
            <span key={idx} className="note-tag-chip">
              <TagIcon size={10} />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer: Date and Action Buttons */}
      <div className="note-card-footer">
        <span className="note-date">
          {formatDate(note.updated_at || note.created_at)}
        </span>

        <div className="note-actions">
          <button
            className="card-action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            title="Edit note"
          >
            <EditIcon size={15} />
          </button>

          <button
            className="card-action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
                onDelete(note.id);
              }
            }}
            title="Delete note"
          >
            <TrashIcon size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
