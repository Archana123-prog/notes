import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isPinnedFilter, setIsPinnedFilter] = useState(false);
  const [isArchivedFilter, setIsArchivedFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  // Theme state: 'light' (white theme) or 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('notes_theme') || 'light';
  });

  // Note Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Notifications
  const [toasts, setToasts] = useState([]);
  const [dbStatus, setDbStatus] = useState('checking');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('notes_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Helper to trigger toast notifications
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check backend and Neon DB connectivity
  const checkDatabaseHealth = useCallback(async () => {
    try {
      const data = await api.health.check();
      if (data?.database?.status === 'connected') {
        setDbStatus('connected');
      } else {
        setDbStatus('connected');
      }
    } catch {
      setDbStatus('disconnected');
    }
  }, []);

  // Fetch notes from Neon DB via Express backend
  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchQuery,
        category: activeCategory,
        pinned: isPinnedFilter ? true : undefined,
        archived: isArchivedFilter ? true : false,
      };

      const data = await api.notes.getAll(filters);
      if (data && data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error('Error loading notes:', err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, isPinnedFilter, isArchivedFilter, showToast]);

  // Initial load
  useEffect(() => {
    checkDatabaseHealth();
    loadNotes();
  }, [checkDatabaseHealth, loadNotes]);

  // Collect all unique tags across notes
  const availableTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => {
      if (Array.isArray(note.tags)) {
        note.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Filter notes client-side for immediate tag matching
  const displayedNotes = useMemo(() => {
    let result = notes;
    if (selectedTag) {
      result = result.filter(
        (n) => Array.isArray(n.tags) && n.tags.includes(selectedTag)
      );
    }
    return result;
  }, [notes, selectedTag]);

  const pinnedNotesCount = useMemo(() => {
    return notes.filter((n) => n.is_pinned).length;
  }, [notes]);

  // Handle Note Save (Create or Edit)
  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        // Update existing note
        const response = await api.notes.update(editingNote.id, noteData);
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNote.id ? response.note : n))
        );
        showToast('Note updated successfully!', 'success');
      } else {
        // Create new note
        const response = await api.notes.create(noteData);
        setNotes((prev) => [response.note, ...prev]);
        showToast('New note created in Neon DB!', 'success');
      }
      setEditingNote(null);
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // Quick toggle pin
  const handleTogglePin = async (id) => {
    try {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n))
      );
      const response = await api.notes.togglePin(id);
      showToast(
        response.note.is_pinned ? '📌 Pinned to top' : 'Unpinned note',
        'info'
      );
    } catch (err) {
      showToast(err.message, 'error');
      loadNotes(); // rollback
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    try {
      await api.notes.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('Note deleted successfully', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setIsPinnedFilter(false);
    setIsArchivedFilter(false);
    setSelectedTag(null);
  };

  return (
    <div className="app-container">
      {/* Top Navbar with Theme Toggle */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateModal={handleOpenCreateModal}
        dbStatus={dbStatus}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Layout: Sidebar + Notes Area */}
      <main className="main-content-layout">
        <Sidebar
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isPinnedFilter={isPinnedFilter}
          setIsPinnedFilter={setIsPinnedFilter}
          isArchivedFilter={isArchivedFilter}
          setIsArchivedFilter={setIsArchivedFilter}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          availableTags={availableTags}
          notesCount={notes.length}
          pinnedCount={pinnedNotesCount}
        />

        <section className="notes-main-area">
          {/* Header bar */}
          <div className="notes-header-bar">
            <div>
              <h1 className="current-view-title">
                {isPinnedFilter
                  ? 'Pinned Notes'
                  : isArchivedFilter
                  ? 'Archived Notes'
                  : selectedTag
                  ? `Tagged with #${selectedTag}`
                  : activeCategory === 'All'
                  ? 'All Notes'
                  : `${activeCategory} Notes`}
              </h1>
              <span className="view-meta-count">
                {displayedNotes.length}{' '}
                {displayedNotes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          </div>

          {/* Notes Grid or Empty State */}
          {loading && notes.length === 0 ? (
            <div className="empty-state-wrapper glass-panel">
              <span className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                Loading notes from Neon DB...
              </span>
            </div>
          ) : displayedNotes.length === 0 ? (
            <EmptyState
              isSearching={Boolean(searchQuery || selectedTag || activeCategory !== 'All')}
              onOpenCreateModal={handleOpenCreateModal}
              resetFilters={resetFilters}
            />
          ) : (
            <div className="notes-grid">
              {displayedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Note Create/Edit Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        initialNote={editingNote}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
