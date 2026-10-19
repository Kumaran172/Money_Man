/**
 * Educational Middleware: Global Error Handler
 * 
 * In Express, functions with FOUR arguments `(err, req, res, next)` are recognized
 * specifically as error-handling middleware.
 * 
 * If any route throws an error or calls `next(error)`, Express skips all regular routes
 * and immediately jumps directly into this safety net function.
 */
export function globalErrorHandler(err, req, res, next) {
  console.error('🔥 Server Error Intercepted:', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
}
