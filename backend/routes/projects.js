import { Router } from 'express';
import Project from '../models/Project.js';
import Branding from '../models/Branding.js';
import VersionHistory from '../models/VersionHistory.js';
import { verifyToken, checkTenantAccess, requireEditor } from '../middleware/auth.js';
import { generateWithGemini } from '../services/gemini.js';

const router = Router();

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/projects/:tenantId  — list all projects for current user in tenant
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:tenantId', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const projects = await Project.find({ tenantId: req.tenantId, userId: req.userId })
      .populate('activeVersionId')
      .sort({ updatedAt: -1 });
    res.json({ ok: true, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/projects/:tenantId  — create a new project (any user in tenant)
// Body: { name, description? }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/:tenantId', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name is required.' });

    const project = await Project.create({
      tenantId: req.tenantId,
      userId: req.userId,
      name,
      description,
    });

    res.status(201).json({ ok: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/projects/:tenantId/:projectId  — get single project
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:tenantId/:projectId', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      tenantId: req.tenantId,
    }).populate('activeVersionId');

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    // Users can only view their own projects, admins can view all
    if (req.userRole !== 'admin' && project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ ok: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/projects/:tenantId/:projectId  — update project
// Body: { name?, description?, status? }
// (Only owner or admin can update)
// ══════════════════════════════════════════════════════════════════════════════
router.put('/:tenantId/:projectId', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      tenantId: req.tenantId,
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (req.userRole !== 'admin' && project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { name, description, status } = req.body;
    if (name !== undefined)        project.name = name;
    if (description !== undefined)  project.description = description;
    if (status !== undefined)       project.status = status;
    await project.save();

    res.json({ ok: true, project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /api/projects/:tenantId/:projectId  — delete project + versions
// (Only owner or admin can delete)
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/:tenantId/:projectId', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      tenantId: req.tenantId,
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (req.userRole !== 'admin' && project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    await VersionHistory.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ ok: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /api/projects/:tenantId/:projectId/generate
// AI website generation via Gemini (any user in tenant can generate)
// Body: { prompt }
// ══════════════════════════════════════════════════════════════════════════════
router.post('/:tenantId/:projectId/generate', verifyToken, checkTenantAccess, requireEditor, async (req, res) => {
  try {
    const { prompt, previousHtml } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const project = await Project.findOne({
      _id: req.params.projectId,
      tenantId: req.tenantId,
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    // Any user can generate (owner or not)
    // But they can only generate for their own projects unless admin
    if (req.userRole !== 'admin' && project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Fetch tenant branding — auto-create if missing (e.g. seeded users without branding)
    let branding = await Branding.findOne({ tenantId: req.tenantId });
    if (!branding) {
      const Tenant = (await import('../models/Tenant.js')).default;
      const tenant  = await Tenant.findById(req.tenantId);
      branding = await Branding.create({
        tenantId:    req.tenantId,
        companyName: tenant?.name || 'My Company',
      });
    }

    // Call Gemini, passing previous version for styling consistency
    const htmlCode = await generateWithGemini(prompt, branding, previousHtml);

    // Calculate version number
    const versionCount = await VersionHistory.countDocuments({ projectId: project._id });
    const versionNumber = versionCount + 1;

    // Freeze branding snapshot
    const brandingSnapshot = {
      companyName:    branding.companyName,
      logo:           branding.logo,
      primaryColor:   branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor:    branding.accentColor,
      // Prefer new field names if present
      bgColor:         branding.bgColor || branding.backgroundColor,
      textColor:       branding.textColor || '#111111',
      fontHeading:    branding.fontHeading,
      fontBody:       branding.fontBody,
      services:       branding.services.map((s) => ({ name: s.name, description: s.description, price: s.price })),
      images:         branding.images.map((img) => img.url),
    };

    // Deactivate previous versions
    await VersionHistory.updateMany({ projectId: project._id }, { status: 'inactive' });

    // Save new active version
    const version = await VersionHistory.create({
      tenantId:    req.tenantId,
      projectId:   project._id,
      userId:      req.userId,
      versionNumber,
      userPrompt:  prompt,
      htmlCode,
      brandingSnapshot,
      status:      'active',
    });

    // Update project's active version
    project.activeVersionId = version._id;
    await project.save();

    res.status(201).json({ ok: true, version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /api/projects/:tenantId/:projectId/versions  — list all versions
// ══════════════════════════════════════════════════════════════════════════════
router.get('/:tenantId/:projectId/versions', verifyToken, checkTenantAccess, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      tenantId: req.tenantId,
    });

    if (!project) return res.status(404).json({ error: 'Project not found.' });

    if (req.userRole !== 'admin' && project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const versions = await VersionHistory.find({ projectId: project._id }).sort({
      versionNumber: -1,
    });

    res.json({ ok: true, versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PUT /api/projects/:tenantId/:projectId/versions/:versionId/rollback
// Set a previous version as active
// ══════════════════════════════════════════════════════════════════════════════
router.put(
  '/:tenantId/:projectId/versions/:versionId/rollback',
  verifyToken,
  checkTenantAccess,
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.projectId,
        tenantId: req.tenantId,
      });

      if (!project) return res.status(404).json({ error: 'Project not found.' });

      if (req.userRole !== 'admin' && project.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      const version = await VersionHistory.findOne({
        _id: req.params.versionId,
        projectId: project._id,
      });

      if (!version) return res.status(404).json({ error: 'Version not found.' });

      // Deactivate all → activate target
      await VersionHistory.updateMany({ projectId: project._id }, { status: 'inactive' });
      version.status = 'active';
      await version.save();

      project.activeVersionId = version._id;
      await project.save();

      res.json({ ok: true, version });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
