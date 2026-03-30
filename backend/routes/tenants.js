import { Router } from 'express';
import Tenant from '../models/Tenant.js';
import { auth, verifyToken, checkTenantAccess, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/current', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId).populate('ownerUserId', 'name email');
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found.' });
    res.json({ success: true, data: tenant });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/tenants/:tenantId  — get tenant details
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:tenantId', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.tenantId)
      .populate('ownerUserId', 'name email');
    
    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

    res.json({ ok: true, tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/tenants/:tenantId  — update tenant details (ADMIN ONLY)
// Body: { name?, description?, logo? }
// ══════════════════════════════════════════════════════════════════════════════
router.put('/:tenantId', verifyToken, checkTenantAccess, requireAdmin, async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const tenant = await Tenant.findById(req.tenantId);

    if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });

    if (name !== undefined)        tenant.name = name;
    if (description !== undefined) tenant.description = description;
    if (logo !== undefined)        tenant.logo = logo;
    await tenant.save();

    res.json({ ok: true, tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
