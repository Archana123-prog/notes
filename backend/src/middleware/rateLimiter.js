const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Creating Notes:
 * Allows a maximum of 2 note creations per 1 minute per IP address.
 */
const createNoteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 2, // Limit each IP to 2 note creation requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 429,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      message: 'Rate limit exceeded: You can only create up to 2 notes per minute. Please wait a moment before creating another note.',
    });
  },
});

module.exports = {
  createNoteLimiter,
};
