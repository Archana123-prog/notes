import React from 'react';

export default function EmptyState({ isSearching, onOpenCreateModal, resetFilters }) {
  return (
    <div className="empty-state-wrapper glass-panel animate-fade-in">
      <div className="empty-state-graphic">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="url(#emptyGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>

      <h3 className="empty-state-title">
        {isSearching ? 'No matching notes found' : 'No notes in this view yet'}
      </h3>

      <p className="empty-state-subtitle">
        {isSearching
          ? 'Try adjusting your search terms or filter criteria.'
          : 'Capture your thoughts, ideas, plans, and todos powered by Neon PostgreSQL.'}
      </p>

      <div className="empty-state-actions">
        {isSearching ? (
          <button className="btn btn-secondary" onClick={resetFilters}>
            Clear Filters
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <span>+</span> Create First Note
          </button>
        )}
      </div>
    </div>
  );
}
