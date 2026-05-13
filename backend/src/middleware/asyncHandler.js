/**
 * Wraps an async route handler and forwards any thrown errors to Express's
 * next(err) — eliminating repetitive try/catch blocks in every route.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
