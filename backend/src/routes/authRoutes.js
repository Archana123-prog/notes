const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register a new account
router.post('/register', authController.register);

// POST /api/auth/login - Log in with email & password
router.post('/login', authController.login);

// GET /api/auth/me - Get current user profile (protected)
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
