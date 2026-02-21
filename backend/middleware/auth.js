import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Verify JWT Token & Extract tenant/user/role ──────────────────────────────
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId   = decoded.userId;
    req.tenantId = decoded.tenantId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ error: 'Invalid token.' });
  }
}

// Role hierarchy: admin > editor > viewer
const ROLE_LEVEL = { admin: 3, editor: 2, viewer: 1 };

// ── Require exact admin role ──────────────────────────────────────────────────
export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin role required.' });
  }
  next();
}

// ── Require admin or editor (viewers cannot mutate) ──────────────────────────
export function requireEditor(req, res, next) {
  const level = ROLE_LEVEL[req.userRole] || 0;
  if (level < ROLE_LEVEL.editor) {
    return res.status(403).json({ error: 'Editor or Admin role required.' });
  }
  next();
}

// ── Any authenticated tenant member is allowed (all 3 roles) ──────────────────
export function requireMember(req, res, next) {
  if (!ROLE_LEVEL[req.userRole]) {
    return res.status(403).json({ error: 'Valid role required.' });
  }
  next();
}

// ── Check if user belongs to the specified tenant ────────────────────────────
// Pass tenantId as a query param or route param (/:tenantId)
export function checkTenantAccess(req, res, next) {
  const tenantIdParam = req.params.tenantId || req.query.tenantId;
  if (!tenantIdParam) {
    return res.status(400).json({ error: 'Tenant ID required.' });
  }
  if (tenantIdParam !== req.tenantId.toString()) {
    return res.status(403).json({ error: 'Access denied to this tenant.' });
  }
  next();
}
