import React from 'react';
import { NoteIcon, SearchIcon, PlusIcon, UserIcon, LogoutIcon, DatabaseIcon, CloseIcon } from './Icons';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenCreateModal,
  dbStatus,
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

          {/* User Auth Profile */}
          {currentUser ? (
            <div className="user-profile-menu">
              <div className="user-avatar" title={currentUser.email}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
              </div>
              <button
                className="btn btn-ghost btn-sm logout-btn"
                onClick={onLogout}
                title="Log out"
              >
                <LogoutIcon size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onOpenAuthModal}>
              <UserIcon size={16} />
              <span>Sign In / Sign Up</span>
            </button>
          )}

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
