/**
 * Educational Middleware: Request Logger
 * 
 * HOW MIDDLEWARE WORKS:
 * In Express, middleware functions have access to the Request object (req),
 * the Response object (res), and the next middleware function in the application's
 * request-response cycle (next).
 * 
 * Think of it as a gatekeeper that sees every person (request) walking into a building.
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  // Listen for the finish event on the response to log how long it took
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    
    // Choose status color for console readability
    const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const resetColor = '\x1b[0m';
    const methodColor = '\x1b[36m';

    console.log(
      `[${timestamp}] ${methodColor}${req.method}${resetColor} ${req.originalUrl} -> ${statusColor}${status}${resetColor} (${duration}ms) [IP: ${req.ip || 'unknown'}]`
    );
  });

  // CRITICAL: Call next() so Express knows to pass control to the NEXT middleware or route handler!
  // If you forget next(), the request will hang indefinitely.
  next();
}
