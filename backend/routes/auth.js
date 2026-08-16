import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Branding from '../models/Branding.js';
import { verifyToken } from '../middleware/auth.js';
import { getPlanConfig, getPlanLimits, hasPlanLimitMismatch, isValidPlan } from '../config/plans.js';
import { normalizeEmail, normalizeSlug, normalizeName } from '../utility/normalize.js';

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

async function ensureTenantPlanLimits(tenantDoc) {
  if (!tenantDoc) return null;
  let doc = tenantDoc;
  if (typeof doc.save !== 'function') {
    doc = await Tenant.findById(doc._id || doc);
    if (!doc) return null;
  }
  if (!hasPlanLimitMismatch(doc.plan, doc.limits)) return doc;

  doc.limits = getPlanLimits(doc.plan);
  await doc.save();
  return doc;
}

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/auth/register
// Body: { tenantName, tenantSlug, ownerName, ownerEmail, password }
// Creates: Tenant → Owner User (role: admin) → Tenant Branding
// ══════════════════════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  try {
    const { tenantName, tenantSlug, ownerName, ownerEmail, password, plan } = req.body;

    if (!tenantName || !tenantSlug || !ownerName || !ownerEmail || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const selectedPlan = isValidPlan(plan) ? plan : 'free';
    const normalizedEmail = normalizeEmail(ownerEmail);
    const normalizedSlug = normalizeSlug(tenantSlug);
    const cleanTenantName = normalizeName(tenantName);
    const cleanOwnerName = normalizeName(ownerName);

    // Check if user email is already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    // Check if slug is already taken
    const existingTenant = await Tenant.findOne({ slug: normalizedSlug });
    if (existingTenant) {
      return res.status(409).json({ error: 'Tenant slug already exists.' });
    }

    // Create tenant first (without ownerUserId — we'll update it after creating the user)
    const tenant = await Tenant.create({
      name: cleanTenantName,
      slug: normalizedSlug,
      plan: selectedPlan,
    });

    // Create owner user (admin role)
    const user = await User.create({
      name: cleanOwnerName,
      email: normalizedEmail,
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

    await ensureTenantPlanLimits(tenant);

    const token = signToken(user);

    res.status(201).json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: tenant._id },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        planPrice: getPlanConfig(tenant.plan).price,
        limits: tenant.limits,
        usage: tenant.usage,
        branding: tenant.branding,
      },
      token,
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ error: `A user or tenant with this ${field} already exists.` });
    }
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

    const normalizedEmail = normalizeEmail(email);

    // Lookup user by email
    const user = await User.findOne({ email: normalizedEmail }).populate('tenantId');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await ensureTenantPlanLimits(user.tenantId);

    const token = signToken(user);

    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId._id },
      tenant: {
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        plan: user.tenantId.plan,
        planPrice: getPlanConfig(user.tenantId.plan).price,
        limits: user.tenantId.limits,
        usage: user.tenantId.usage,
        branding: user.tenantId.branding,
      },
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

    await ensureTenantPlanLimits(user.tenantId);

    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId._id },
      tenant: {
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        plan: user.tenantId.plan,
        planPrice: getPlanConfig(user.tenantId.plan).price,
        limits: user.tenantId.limits,
        usage: user.tenantId.usage,
        branding: user.tenantId.branding,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
