import React from 'react';
import { NoteIcon, SearchIcon, PlusIcon, DatabaseIcon, CloseIcon, SunIcon, MoonIcon } from './Icons';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  dbStatus,
  theme,
  toggleTheme,
}) {
  return (
    <header className="navbar-wrapper glass-panel">
      <div className="navbar-container">
        {/* Brand & Logo */}
        <div className="navbar-brand">
          <div className="brand-icon-wrapper">
            <NoteIcon size={22} className="brand-svg" />
          </div>
          <div className="brand-text">
            <span className="brand-name gradient-text">AuraNotes</span>
            <span className="brand-badge">Neon DB</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search">
          <SearchIcon size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Actions & Status */}
        <div className="navbar-actions">
          {/* Neon DB status badge */}
          <div
            className={`db-status-badge ${dbStatus === 'connected' ? 'connected' : 'connecting'}`}
            title={`Neon DB: ${dbStatus}`}
          >
            <DatabaseIcon size={14} />
            <span className="status-dot"></span>
            <span className="status-text">{dbStatus === 'connected' ? 'Neon Active' : 'Connecting'}</span>
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            className="btn btn-secondary btn-icon theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to White Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            <span className="theme-toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* New Note Button */}
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <PlusIcon size={18} />
            <span>New Note</span>
          </button>
        </div>
      </div>
    </header>
  );
}
