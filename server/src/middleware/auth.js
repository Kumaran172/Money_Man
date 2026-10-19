import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'money_man_super_secret_2026';

/**
 * Authentication Middleware
 * Protects all routes that require a logged-in user.
 * Reads the Bearer token from the Authorization header.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Please log in first.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email }
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Session expired or invalid. Please log in again.'
    });
  }
}

/**
 * Optional Auth Middleware
 * Populates req.user if a valid token is present, but does not block requests without token
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore invalid token in optional mode
    }
  }
  next();
}

export { JWT_SECRET };

