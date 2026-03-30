import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function getToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return req.query.token || null;
}

async function hydrateUser(decoded) {
  const userId = decoded.id || decoded.userId;
  if (!userId) return null;
  return User.findById(userId).populate('tenant').populate('tenantId');
}

export function generateToken(user) {
  const userId = String(user._id);
  const tenantId = String(user.tenant?._id || user.tenantId?._id || user.tenant || user.tenantId || '');
  const role = user.role || 'editor';
  return jwt.sign({ id: userId, userId, tenantId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Site-pilot style middleware
export async function auth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await hydrateUser(decoded);
    if (!user || user.status === 'suspended') {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    const tenantId = user.tenant?._id || user.tenantId?._id || user.tenant || user.tenantId;
    req.user = user;
    req.userId = String(user._id);
    req.userRole = user.role;
    req.tenantId = String(tenantId);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// ── Verify JWT Token & Extract tenant/user/role (legacy compatibility) ─────
export async function verifyToken(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let userId = decoded.userId || decoded.id;
    let tenantId = decoded.tenantId;
    let role = decoded.role;

    if (!tenantId || !role) {
      const user = await hydrateUser(decoded);
      if (!user) return res.status(403).json({ error: 'Invalid token.' });
      userId = String(user._id);
      tenantId = String(user.tenant?._id || user.tenantId?._id || user.tenant || user.tenantId);
      role = user.role;
      req.user = user;
    }

    req.userId = String(userId);
    req.tenantId = String(tenantId);
    req.userRole = role;
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
  if (tenantIdParam.toString() !== req.tenantId.toString()) {
    return res.status(403).json({ error: 'Access denied to this tenant.' });
  }
  next();
}
