import express from 'express';
import fs from 'fs';
import { generateWithAISDK } from '../services/ai.js';
import Website from '../models/Website.js';
import Page from '../models/Page.js';
import Tenant from '../models/Tenant.js';
import Branding from '../models/Branding.js';
import ActivityLog from '../models/ActivityLog.js';
import { auth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = express.Router();

function cleanGeneratedHTML(text) {
    return text.toString()
        .replace(/^```html\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim();
}

router.post('/generate', auth, requirePermission('ai.generate'), async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.tenantId);
        if (tenant.limits.aiGenerations !== -1 && tenant.usage.aiGenerations >= tenant.limits.aiGenerations) {
            console.warn(`[AI_ROUTE] [WARN] Generation limit reached for tenant: ${req.tenantId}`);
            return res.status(403).json({ success: false, error: 'AI generation limit reached. Upgrade your plan.' });
        }

        const { prompt, websiteId, previousHtml } = req.body;
        if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

        console.log(`\n------------------------------------------------------`);
        console.log(`[AI_ROUTE] Incoming AI generation request received`);
        console.log(`[AI_ROUTE] Tenant ID   : ${req.tenantId}`);
        console.log(`[AI_ROUTE] Website ID  : ${websiteId || '(new website)'}`);
        console.log(`[AI_ROUTE] Prompt      : "${prompt.substring(0, 120)}${prompt.length > 120 ? '...' : ''}"`);
        console.log(`[AI_ROUTE] Context     : ${previousHtml ? 'Editing existing HTML' : 'New generation'}`);
        console.log(`------------------------------------------------------`);

        let existingHTML = previousHtml || '';
        let website = null;
        if (websiteId) {
            website = await Website.findOne({ _id: websiteId, tenant: req.tenantId });
            if (website && !existingHTML) existingHTML = website.generatedHTML || '';
        }

        const dbBranding = await Branding.findOne({ tenantId: req.tenantId });
        const branding = dbBranding ? dbBranding.toObject() : {
            companyName: website?.name || 'My Company',
            companyDescription: website?.description || '',
            primaryColor: '#6366f1',
            secondaryColor: '#4f46e5',
            backgroundColor: '#ffffff',
            textColor: '#ffffff',
            fontHeading: 'Inter',
            fontBody: 'Inter'
        };

        if (website?.name && !branding.companyName) branding.companyName = website.name;
        if (website?.description && !branding.companyDescription) branding.companyDescription = website.description;

        console.log(`[AI_ROUTE] Calling AI model (meta/muse-spark-1.2-contributor) via Vercel AI SDK...`);
        const rawHTML = await generateWithAISDK(prompt, branding, existingHTML);
        const fullHTML = cleanGeneratedHTML(rawHTML);

        let versionNumber = 1;
        if (websiteId && fullHTML.length > 100 && website) {
            if (website.generatedHTML && website.generatedHTML.length > 100) {
                website.versions.push({
                    version: website.currentVersion || 1,
                    html: website.generatedHTML,
                    prompt: prompt.substring(0, 200),
                    label: `v${website.currentVersion || 1}`,
                    createdAt: new Date(),
                });
            }

            versionNumber = (website.currentVersion || 0) + 1;

            let modifiedHTML = fullHTML;
            if (modifiedHTML.includes('</body>')) {
                modifiedHTML = modifiedHTML.replace('</body>', `\n<script>window.WEBSITE_ID = "${websiteId}";</script>\n</body>`);
            } else {
                modifiedHTML += `\n<script>window.WEBSITE_ID = "${websiteId}";</script>\n`;
            }

            website.generatedHTML = modifiedHTML;
            website.currentVersion = versionNumber;

            // Keep Website and Page data in sync so the Manage tab always shows
            // the generated homepage for this website.
            const homeSlug = 'home';
            const existingPage = await Page.findOne({
                website: website._id,
                tenant: req.tenantId,
                slug: homeSlug,
            });

            if (existingPage) {
                if (existingPage.generatedHTML && existingPage.generatedHTML.length > 100) {
                    existingPage.versions.push({
                        version: existingPage.version || 1,
                        components: existingPage.components || [],
                        generatedHTML: existingPage.generatedHTML,
                        createdBy: req.user._id,
                        message: `Auto-sync from website generation v${versionNumber}`,
                    });
                    existingPage.version = (existingPage.version || 1) + 1;
                }
                existingPage.title = existingPage.title || 'Home';
                existingPage.generatedHTML = modifiedHTML;
                existingPage.status = website.status === 'published' ? 'published' : (existingPage.status || 'draft');
                await existingPage.save();
            } else {
                await Page.create({
                    title: 'Home',
                    slug: homeSlug,
                    website: website._id,
                    tenant: req.tenantId,
                    components: [],
                    generatedHTML: modifiedHTML,
                    status: website.status === 'published' ? 'published' : 'draft',
                });
                tenant.usage.pages += 1;
            }

            website.chatHistory.push(
                { role: 'user', content: prompt, ts: Date.now() },
                { role: 'ai', content: `Website generated! (v${versionNumber})`, ts: Date.now() }
            );

            website.promptHistory.push({ prompt });
            await website.save();
        }

        tenant.usage.aiGenerations += 1;
        await tenant.save();

        await ActivityLog.create({
            user: { id: req.user._id, name: req.user.name, email: req.user.email },
            tenant: req.tenantId,
            action: 'ai.generate',
            entityType: 'website',
            entityId: websiteId,
            details: { prompt: prompt.substring(0, 100), version: versionNumber, htmlLength: fullHTML.length },
            ipAddress: req.ip,
        });

        console.log(`[AI_ROUTE] Sending response to client (Version: v${versionNumber}, HTML size: ${fullHTML.length} chars)`);

        res.json({
            ok: true,
            generation: {
                target: 'frontend',
                provider: 'vercel-ai',
                model: 'meta/muse-spark-1.2-contributor',
                reasoning: 'high',
            },
            version: {
                versionNumber,
                htmlCode: fullHTML
            },
            tenant: {
                plan: tenant.plan,
                limits: tenant.limits,
                usage: tenant.usage,
            },
            usage: {
                used: tenant.usage.aiGenerations,
                limit: tenant.limits.aiGenerations,
            },
        });

    } catch (err) {
        console.error(`[AI_ROUTE] [ERROR] Generation error: ${err.message}`);
        fs.appendFileSync('ai-error-log.txt', `\n==== ERROR ====\nMessage: ${err.message}\nStack: ${err.stack}\n`);
        const userError = err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('rate limit')
            ? 'AI API rate limit reached. Please wait a moment and try again.'
            : err.message?.includes('API_KEY') || err.message?.includes('apiKey') || err.message?.includes('unauthorized') || err.message?.includes('401')
                ? 'Invalid API key or unauthorized. Check your AI Gateway / API key configuration in .env.'
                : `AI generation failed: ${err.message || 'Please try again.'}`;
        res.status(500).json({ ok: false, error: userError });
    }
});

export default router;
