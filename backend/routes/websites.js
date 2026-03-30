import express from 'express';
import Website from '../models/Website.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';
import { auth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = express.Router();

router.get('/view/:slug', async (req, res) => {
    try {
        const website = await Website.findOne({ slug: req.params.slug });
        if (!website) return res.status(404).send('<h1>Website not found</h1>');
        res.send(website.generatedHTML || '<h1>No content generated yet</h1>');
    } catch {
        res.status(500).send('<h1>Server error loading preview</h1>');
    }
});

router.get('/', auth, async (req, res) => {
    const websites = await Website.find({ tenant: req.tenantId }).sort({ updatedAt: -1 });
    res.json({ success: true, data: websites });
});

router.get('/:id', auth, async (req, res) => {
    const website = await Website.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });
    res.json({ success: true, data: website });
});

router.post('/', auth, requirePermission('website.create'), async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.tenantId);
        if (tenant.limits.websites !== -1 && tenant.usage.websites >= tenant.limits.websites) {
            return res.status(403).json({ success: false, error: 'Website limit reached. Upgrade your plan.' });
        }

        const { name, description, businessType } = req.body;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const website = await Website.create({ name, slug, description, businessType, tenant: req.tenantId });
        tenant.usage.websites += 1;
        await tenant.save();

        await ActivityLog.create({
            user: { id: req.user._id, name: req.user.name, email: req.user.email },
            tenant: req.tenantId,
            action: 'website.create',
            entityType: 'website',
            entityId: website._id,
            details: { name, businessType },
            ipAddress: req.ip,
        });

        res.status(201).json({ success: true, data: website });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to create website' });
    }
});

router.put('/:id', auth, requirePermission('website.edit'), async (req, res) => {
    const website = await Website.findOneAndUpdate(
        { _id: req.params.id, tenant: req.tenantId },
        { $set: req.body },
        { new: true }
    );
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });
    res.json({ success: true, data: website });
});

router.delete('/:id', auth, requirePermission('website.delete'), async (req, res) => {
    const website = await Website.findOneAndDelete({ _id: req.params.id, tenant: req.tenantId });
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });
    const tenant = await Tenant.findById(req.tenantId);
    tenant.usage.websites = Math.max(0, tenant.usage.websites - 1);
    await tenant.save();
    res.json({ success: true, message: 'Website deleted' });
});

router.get('/:id/chat', auth, async (req, res) => {
    const website = await Website.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });
    res.json({
        success: true,
        data: {
            chatHistory: website.chatHistory || [],
            promptHistory: website.promptHistory || [],
            generatedHTML: website.generatedHTML || '',
            currentVersion: website.currentVersion || 1,
        }
    });
});

router.get('/:id/versions', auth, async (req, res) => {
    const website = await Website.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });

    const versions = (website.versions || []).map(v => ({
        version: v.version,
        prompt: v.prompt,
        label: v.label,
        createdAt: v.createdAt,
        htmlLength: v.html?.length || 0,
    }));

    versions.push({
        version: website.currentVersion || 1,
        prompt: 'Current',
        label: `v${website.currentVersion || 1} (current)`,
        createdAt: website.updatedAt,
        htmlLength: website.generatedHTML?.length || 0,
        isCurrent: true,
    });

    res.json({ success: true, data: versions });
});

router.post('/:id/versions/:version/restore', auth, requirePermission('website.edit'), async (req, res) => {
    try {
        const website = await Website.findOne({ _id: req.params.id, tenant: req.tenantId });
        if (!website) return res.status(404).json({ success: false, error: 'Website not found' });

        const targetVersion = parseInt(req.params.version, 10);
        const versionEntry = website.versions.find(v => v.version === targetVersion);
        if (!versionEntry) return res.status(404).json({ success: false, error: 'Version not found' });

        if (website.generatedHTML && website.generatedHTML.length > 100) {
            website.versions.push({
                version: website.currentVersion,
                html: website.generatedHTML,
                prompt: 'Before restore',
                label: `v${website.currentVersion} (before restore)`,
                createdAt: new Date(),
            });
        }

        website.generatedHTML = versionEntry.html;
        website.currentVersion = (website.currentVersion || 0) + 1;

        website.chatHistory.push(
            { role: 'ai', content: `🔄 Restored to v${targetVersion}. Now at v${website.currentVersion}.`, ts: Date.now() }
        );

        await website.save();

        await ActivityLog.create({
            user: { id: req.user._id, name: req.user.name, email: req.user.email },
            tenant: req.tenantId,
            action: 'website.restoreVersion',
            entityType: 'website',
            entityId: website._id,
            details: { restoredVersion: targetVersion, newVersion: website.currentVersion },
            ipAddress: req.ip,
        });

        res.json({ success: true, data: { version: website.currentVersion, html: website.generatedHTML } });
    } catch {
        res.status(500).json({ success: false, error: 'Failed to restore version' });
    }
});

router.get('/:id/versions/:version/html', auth, async (req, res) => {
    const website = await Website.findOne({ _id: req.params.id, tenant: req.tenantId });
    if (!website) return res.status(404).json({ success: false, error: 'Website not found' });

    const targetVersion = parseInt(req.params.version, 10);
    if (targetVersion === website.currentVersion) {
        return res.json({ success: true, data: { version: targetVersion, html: website.generatedHTML } });
    }

    const entry = website.versions.find(v => v.version === targetVersion);
    if (!entry) return res.status(404).json({ success: false, error: 'Version not found' });
    res.json({ success: true, data: { version: entry.version, html: entry.html } });
});

export default router;
