import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Branding from '../models/Branding.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Always store primitive strings in the JWT so decoded values are safe to
// compare. When 'user.tenantId' is a populated Tenant document (login route)
// we need ._id; when it's already an ObjectId (register route) toString() works.
const signToken = (user) =>
  jwt.sign(
    {
      userId:   String(user._id),
      tenantId: String(user.tenantId?._id ?? user.tenantId),
      role:     user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/register
// Body: { tenantName, tenantSlug, ownerName, ownerEmail, password }
// Creates: Tenant → Owner User (role: admin) → Tenant Branding
// ══════════════════════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  try {
    const { tenantName, tenantSlug, ownerName, ownerEmail, password } = req.body;

    if (!tenantName || !tenantSlug || !ownerName || !ownerEmail || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if slug is already taken
    const existingTenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
    if (existingTenant) {
      return res.status(409).json({ error: 'Tenant slug already exists.' });
    }

    // Create tenant first (without ownerUserId — we'll update it after creating the user)
    const tenant = await Tenant.create({
      name: tenantName,
      slug: tenantSlug.toLowerCase(),
    });

    // Create owner user (admin role)
    const user = await User.create({
      name: ownerName,
      email: ownerEmail,
      password,
      tenantId: tenant._id,
      role: 'admin',
    });

    // Update tenant with ownerUserId
    tenant.ownerUserId = user._id;
    await tenant.save();

    // Auto-create tenant branding
    await Branding.create({
      tenantId: tenant._id,
      companyName: tenantName,
    });

    const token = signToken(user);

    res.status(201).json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: tenant._id },
      tenant: { id: tenant._id, name: tenant.name, slug: tenant.slug },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/login
// Body: { email, password }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Lookup user by email (can exist in multiple tenants, but typically one per email)
    const user = await User.findOne({ email }).populate('tenantId');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);

    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId._id },
      tenant: { id: user.tenantId._id, name: user.tenantId.name, slug: user.tenantId.slug },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/auth/me
// ══════════════════════════════════════════════════════════════════════════════
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('tenantId');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId._id },
      tenant: { id: user.tenantId._id, name: user.tenantId.name, slug: user.tenantId.slug },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
