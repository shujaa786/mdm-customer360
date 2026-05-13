/**
 * Standardized API response helpers.
 * Keeps controller/route code concise and consistent.
 */

/**
 * Send a 200 success response.
 * @param {import('express').Response} res
 * @param {object} data - Payload to merge into the response body
 * @param {number} [status=200]
 */
const sendSuccess = (res, data = {}, status = 200) => {
  res.status(status).json({ success: true, ...data });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} error - Human-readable error message
 * @param {number} [status=500]
 */
const sendError = (res, error, status = 500) => {
  res.status(status).json({ success: false, error });
};

/**
 * Send a 400 Bad Request response.
 * @param {import('express').Response} res
 * @param {string} error
 */
const sendBadRequest = (res, error) => sendError(res, error, 400);

/**
 * Send a 404 Not Found response.
 * @param {import('express').Response} res
 * @param {string} [error='Not found']
 */
const sendNotFound = (res, error = 'Not found') => sendError(res, error, 404);

/**
 * Send a 409 Conflict response.
 * @param {import('express').Response} res
 * @param {string} error
 */
const sendConflict = (res, error) => sendError(res, error, 409);

module.exports = { sendSuccess, sendError, sendBadRequest, sendNotFound, sendConflict };
