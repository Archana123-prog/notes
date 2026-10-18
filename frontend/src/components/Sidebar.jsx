import React from 'react';
import { PinIcon, TagIcon, SparklesIcon } from './Icons';

export const CATEGORIES = [
  { id: 'All', label: 'All Notes', icon: '📝', color: '#6366f1' },
  { id: 'Work', label: 'Work', icon: '💼', color: '#3b82f6' },
  { id: 'Personal', label: 'Personal', icon: '🌿', color: '#10b981' },
  { id: 'Ideas', label: 'Ideas & Innovation', icon: '💡', color: '#f59e0b' },
  { id: 'Study', label: 'Study & Learning', icon: '📚', color: '#8b5cf6' },
  { id: 'General', label: 'General', icon: '📌', color: '#ec4899' },
];

export default function Sidebar({
  activeCategory,
  setActiveCategory,
  isPinnedFilter,
  setIsPinnedFilter,
  isArchivedFilter,
  setIsArchivedFilter,
  selectedTag,
  setSelectedTag,
  availableTags = [],
  notesCount = 0,
  pinnedCount = 0,
}) {
  return (
    <aside className="sidebar-wrapper glass-panel">
      {/* Overview Stats */}
      <div className="sidebar-stats">
        <div className="stat-card">
          <span className="stat-value">{notesCount}</span>
          <span className="stat-label">Total Notes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{pinnedCount}</span>
          <span className="stat-label">Pinned</span>
        </div>
      </div>

      {/* Main Categories Navigation */}
      <div className="sidebar-section">
        <h4 className="sidebar-heading">Categories</h4>
        <nav className="category-nav">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id && !isPinnedFilter && !isArchivedFilter;
            return (
              <button
                key={cat.id}
                className={`category-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setIsPinnedFilter(false);
                  setIsArchivedFilter(false);
                  setSelectedTag(null);
                }}
              >
                <span className="category-emoji">{cat.icon}</span>
                <span className="category-label">{cat.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters (Pinned, Archived) */}
      <div className="sidebar-section">
        <h4 className="sidebar-heading">Quick Filters</h4>
        <div className="filter-nav">
          <button
            className={`filter-item ${isPinnedFilter ? 'active' : ''}`}
            onClick={() => {
              setIsPinnedFilter(!isPinnedFilter);
              setIsArchivedFilter(false);
              setSelectedTag(null);
            }}
          >
            <PinIcon size={16} filled={isPinnedFilter} />
            <span>Pinned Notes</span>
            {pinnedCount > 0 && <span className="filter-badge">{pinnedCount}</span>}
          </button>

          <button
            className={`filter-item ${isArchivedFilter ? 'active' : ''}`}
            onClick={() => {
              setIsArchivedFilter(!isArchivedFilter);
              setIsPinnedFilter(false);
              setSelectedTag(null);
            }}
          >
            <span>📦</span>
            <span>Archived</span>
          </button>
        </div>
      </div>

      {/* Tags Cloud */}
      {availableTags.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-heading-row">
            <h4 className="sidebar-heading">Tags</h4>
            {selectedTag && (
              <button
                className="clear-tag-btn"
                onClick={() => setSelectedTag(null)}
              >
                Clear
              </button>
            )}
          </div>
          <div className="tags-cloud">
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                <TagIcon size={11} />
                <span>#{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Neon DB Info Footer */}
      <div className="sidebar-footer">
        <div className="neon-info-box">
          <SparklesIcon size={14} className="sparkle-svg" />
          <span>PostgreSQL Serverless by Neon</span>
        </div>
      </div>
    </aside>
  );
}
