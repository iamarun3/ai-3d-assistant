/**
 * middleware/errorHandler.js
 * Centralised Express error handler.
 * Catches all errors passed via next(err) and returns structured JSON.
 */

export function errorHandler(err, req, res, _next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(`❌ [${req.method} ${req.path}] ${status}: ${message}`);
  if (process.env.NODE_ENV !== "production") console.error(err.stack);

  res.status(status).json({
    error:    message,
    path:     req.path,
    fallback: status >= 500,   // hint to frontend: try demo mode
  });
}
