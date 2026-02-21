import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken, checkTenantAccess, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/tenants/:tenantId/users  — list all users in tenant (ADMIN ONLY)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:tenantId/users', verifyToken, checkTenantAccess, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.tenantId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ ok: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/tenants/:tenantId/users  — invite/create new user (ADMIN ONLY)
// Body: { name, email, password, role ('editor' | 'admin') }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/:tenantId/users', verifyToken, checkTenantAccess, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!['editor', 'admin', 'viewer'].includes(role || 'editor')) {
      return res.status(400).json({ error: 'Role must be "editor", "viewer", or "admin".' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists in this tenant
    const existingUser = await User.findOne({ email, tenantId: req.tenantId });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists in this tenant.' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      tenantId: req.tenantId,
      role: role || 'editor',
    });

    res.status(201).json({
      ok: true,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/tenants/:tenantId/users/:userId  — update user (ADMIN ONLY)
// Body: { name?, email?, role? }
// ══════════════════════════════════════════════════════════════════════════════
router.put('/:tenantId/users/:userId', verifyToken, checkTenantAccess, requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      tenantId: req.tenantId,
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { name, email, role } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) {
      if (!['editor', 'admin', 'viewer'].includes(role)) {
        return res.status(400).json({ error: 'Role must be "editor", "viewer", or "admin".' });
      }
      user.role = role;
    }

    await user.save();

    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/tenants/:tenantId/users/:userId  — remove user (ADMIN ONLY)
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/:tenantId/users/:userId', verifyToken, checkTenantAccess, requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      tenantId: req.tenantId,
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ tenantId: req.tenantId, role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin. Assign another admin first.' });
      }
    }

    await user.deleteOne();

    res.json({ ok: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
