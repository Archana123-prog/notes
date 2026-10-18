const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { createNoteLimiter } = require('../middleware/rateLimiter');

// All note routes support both authenticated users (isolated notes) and guest mode
router.use(optionalAuth);

// GET /api/notes - Get all notes (supports search, category, pinned, archived)
router.get('/', noteController.getNotes);

// GET /api/notes/:id - Get single note by ID
router.get('/:id', noteController.getNoteById);

// POST /api/notes - Create a new note (Rate limited: max 2 notes per 1 minute)
router.post('/', createNoteLimiter, noteController.createNote);

// PUT /api/notes/:id - Update an existing note
router.put('/:id', noteController.updateNote);

// PATCH /api/notes/:id/pin - Toggle pin status
router.patch('/:id/pin', noteController.togglePinNote);

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', noteController.deleteNote);

module.exports = router;
