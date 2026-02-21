import { Router } from 'express';
import Branding from '../models/Branding.js';
import Tenant from '../models/Tenant.js';
import { verifyToken, requireAdmin, requireEditor, checkTenantAccess } from '../middleware/auth.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';

const router = Router();

// ── Helper: verify user is admin in their tenant ──────────────────────────────
async function findOwnedBranding(tenantId, requestedTenantId) {
  if (tenantId.toString() !== requestedTenantId.toString()) {
    return null;
  }
  const branding = await Branding.findOne({ tenantId });
  return branding;
}

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/branding/:tenantId  — get tenant branding (any user in tenant)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:tenantId', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const branding = await Branding.findOne({ tenantId: req.tenantId });
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });
    res.json({ ok: true, branding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/branding/:tenantId  — update branding fields (ADMIN ONLY)
// Body: { companyName?, companyDescription?, primaryColor?, secondaryColor?,
//         accentColor?, backgroundColor?, fontHeading?, fontBody? }
// ══════════════════════════════════════════════════════════════════════════════
router.put('/:tenantId', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });

    const allowedFields = [
      'companyName', 'companyDescription', 'primaryColor', 'secondaryColor',
      'accentColor', 'backgroundColor', 'bgColor', 'textColor', 'fontHeading', 'fontBody',
    ];
    for (const key of allowedFields) {
      if (req.body[key] === undefined) continue;
      // When clients send new-style keys like `bgColor` or `textColor`, persist
      // both the new and legacy fields so older code keeps working.
      if (key === 'bgColor') {
        branding.bgColor = req.body.bgColor;
        branding.backgroundColor = req.body.bgColor;
      } else if (key === 'textColor') {
        branding.textColor = req.body.textColor;
        // map to primaryColor usage where appropriate? keep separate for clarity
      } else if (key === 'backgroundColor') {
        branding.backgroundColor = req.body.backgroundColor;
        branding.bgColor = req.body.backgroundColor;
      } else {
        branding[key] = req.body[key];
      }
    }
    await branding.save();

    res.json({ ok: true, branding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/branding/:tenantId/upload-logo   — upload logo (ADMIN ONLY)
// Form Data: file
// ══════════════════════════════════════════════════════════════════════════════
router.post('/:tenantId/upload-logo', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });
    if (!req.file)  return res.status(400).json({ error: 'No file provided.' });

    const url = await uploadToCloudinary(req.file.buffer, 'site-pilot/logos');

    // Delete old logo from Cloudinary if present
    if (branding.logo) await deleteFromCloudinary(branding.logo);

    branding.logo = url;
    await branding.save();

    res.json({ ok: true, logo: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/branding/:tenantId/upload-image  — upload gallery image (ADMIN ONLY)
// Form Data: file, alt?
// ══════════════════════════════════════════════════════════════════════════════
router.post('/:tenantId/upload-image', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });
    if (!req.file)  return res.status(400).json({ error: 'No file provided.' });

    const url = await uploadToCloudinary(req.file.buffer, 'site-pilot/images');
    const image = { url, alt: req.body.alt || 'Image', uploadedAt: new Date() };
    branding.images.push(image);
    await branding.save();

    res.json({ ok: true, image: branding.images[branding.images.length - 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/branding/:tenantId/images/:imageId — remove gallery image (ADMIN ONLY)
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/:tenantId/images/:imageId', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });

    const image = branding.images.id(req.params.imageId);
    if (!image) return res.status(404).json({ error: 'Image not found.' });

    await deleteFromCloudinary(image.url);
    image.deleteOne();
    await branding.save();

    res.json({ ok: true, branding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SERVICES CRUD — nested under branding (ADMIN ONLY)
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/branding/:tenantId/services   — add a new service
// Body: { name, description?, price?, icon? }
router.post('/:tenantId/services', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });

    const { name, description, price, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Service name is required.' });

    branding.services.push({ name, description, price, icon });
    await branding.save();

    const added = branding.services[branding.services.length - 1];
    res.status(201).json({ ok: true, service: added });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/branding/:tenantId/services/:serviceId  — update a service
// Body: { name?, description?, price?, icon? }
router.put('/:tenantId/services/:serviceId', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });

    const service = branding.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    const { name, description, price, icon } = req.body;
    if (name !== undefined)        service.name = name;
    if (description !== undefined)  service.description = description;
    if (price !== undefined)        service.price = price;
    if (icon !== undefined)         service.icon = icon;
    await branding.save();

    res.json({ ok: true, service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/branding/:tenantId/services/:serviceId — remove a service
router.delete('/:tenantId/services/:serviceId', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const branding = await findOwnedBranding(req.tenantId, req.params.tenantId);
    if (!branding) return res.status(404).json({ error: 'Branding not found.' });

    const service = branding.services.id(req.params.serviceId);
    if (!service) return res.status(404).json({ error: 'Service not found.' });

    service.deleteOne();
    await branding.save();

    res.json({ ok: true, branding });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
