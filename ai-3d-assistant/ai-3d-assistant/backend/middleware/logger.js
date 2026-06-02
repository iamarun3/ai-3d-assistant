/**
 * middleware/logger.js
 * Simple request logger — logs method, path, status, and duration.
 */

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms     = Date.now() - start;
    const status = res.statusCode;
    const color  = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : "\x1b[32m";
    console.log(`${color}${req.method}\x1b[0m ${req.path} → ${color}${status}\x1b[0m (${ms}ms)`);
  });
  next();
}
