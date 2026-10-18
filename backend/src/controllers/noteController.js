const db = require('../config/db');

/**
 * Get all notes with optional filtering and search
 * GET /api/notes
 * Query params: ?search=keyword&category=Work&pinned=true&archived=false
 */
const getNotes = async (req, res, next) => {
  try {
    const { search, category, pinned, archived } = req.query;
    const userId = req.user ? req.user.id : null;

    let queryConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    // Filter by user (or guest notes if no user)
    if (userId) {
      queryConditions.push(`user_id = $${paramIndex}`);
      queryParams.push(userId);
      paramIndex++;
    } else {
      queryConditions.push(`user_id IS NULL`);
    }

    // Filter by archived status (default to false if not specified)
    if (archived !== undefined) {
      queryConditions.push(`is_archived = $${paramIndex}`);
      queryParams.push(archived === 'true');
      paramIndex++;
    } else {
      queryConditions.push(`is_archived = false`);
    }

    // Filter by pinned status
    if (pinned !== undefined) {
      queryConditions.push(`is_pinned = $${paramIndex}`);
      queryParams.push(pinned === 'true');
      paramIndex++;
    }

    // Filter by category
    if (category && category !== 'All') {
      queryConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    // Search in title or content
    if (search && search.trim() !== '') {
      queryConditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';
    const sql = `
      SELECT id, user_id, title, content, category, tags, color, is_pinned, is_archived, created_at, updated_at
      FROM notes
      ${whereClause}
      ORDER BY is_pinned DESC, updated_at DESC
    `;

    const result = await db.query(sql, queryParams);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      notes: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single note by ID
 * GET /api/notes/:id
 */
const getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    let sql = 'SELECT * FROM notes WHERE id = $1';
    let params = [id];

    if (userId) {
      sql += ' AND user_id = $2';
      params.push(userId);
    } else {
      sql += ' AND user_id IS NULL';
    }

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Note with id ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      note: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new note
 * POST /api/notes
 * Body: { title, content, category, tags, color, is_pinned }
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content = '', category = 'General', tags = [], color = '#ffffff', is_pinned = false } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note title is required.',
      });
    }

    // Ensure tags is formatted as array
    const formattedTags = Array.isArray(tags) ? tags : [];

    const sql = `
      INSERT INTO notes (user_id, title, content, category, tags, color, is_pinned, is_archived, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await db.query(sql, [
      userId,
      title.trim(),
      content,
      category || 'General',
      formattedTags,
      color || '#ffffff',
      Boolean(is_pinned),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Note created successfully!',
      note: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing note
 * PUT /api/notes/:id
 * Body: { title, content, category, tags, color, is_pinned, is_archived }
 */
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const { title, content, category, tags, color, is_pinned, is_archived } = req.body;

    // Check if note exists and belongs to user
    let checkSql = 'SELECT * FROM notes WHERE id = $1';
    let checkParams = [id];

    if (userId) {
      checkSql += ' AND user_id = $2';
      checkParams.push(userId);
    } else {
      checkSql += ' AND user_id IS NULL';
    }

    const checkResult = await db.query(checkSql, checkParams);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Note with id ${id} not found.`,
      });
    }

    const currentNote = checkResult.rows[0];

    const updatedTitle = title !== undefined ? title.trim() : currentNote.title;
    const updatedContent = content !== undefined ? content : currentNote.content;
    const updatedCategory = category !== undefined ? category : currentNote.category;
    const updatedTags = tags !== undefined ? (Array.isArray(tags) ? tags : currentNote.tags) : currentNote.tags;
    const updatedColor = color !== undefined ? color : currentNote.color;
    const updatedPinned = is_pinned !== undefined ? Boolean(is_pinned) : currentNote.is_pinned;
    const updatedArchived = is_archived !== undefined ? Boolean(is_archived) : currentNote.is_archived;

    if (!updatedTitle || updatedTitle.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note title cannot be empty.',
      });
    }

    const updateSql = `
      UPDATE notes
      SET title = $1,
          content = $2,
          category = $3,
          tags = $4,
          color = $5,
          is_pinned = $6,
          is_archived = $7,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;

    const updateResult = await db.query(updateSql, [
      updatedTitle,
      updatedContent,
      updatedCategory,
      updatedTags,
      updatedColor,
      updatedPinned,
      updatedArchived,
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully!',
      note: updateResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle pin status of a note
 * PATCH /api/notes/:id/pin
 */
const togglePinNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    let sql = `
      UPDATE notes
      SET is_pinned = NOT is_pinned,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    let params = [id];

    if (userId) {
      sql += ' AND user_id = $2';
      params.push(userId);
    } else {
      sql += ' AND user_id IS NULL';
    }

    sql += ' RETURNING *';

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Note with id ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Note ${result.rows[0].is_pinned ? 'pinned' : 'unpinned'} successfully!`,
      note: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a note
 * DELETE /api/notes/:id
 */
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    let sql = 'DELETE FROM notes WHERE id = $1';
    let params = [id];

    if (userId) {
      sql += ' AND user_id = $2';
      params.push(userId);
    } else {
      sql += ' AND user_id IS NULL';
    }

    sql += ' RETURNING id';

    const result = await db.query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Note with id ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully!',
      deletedId: result.rows[0].id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  togglePinNote,
  deleteNote,
};
