import express from 'express';
import Tenant from '../models/Tenant.js';
import Invoice from '../models/Invoice.js';
import ActivityLog from '../models/ActivityLog.js';
import { auth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { getPlanConfig, getPlanLimits, getPlanPublicCatalog, hasPlanLimitMismatch, isValidPlan, PLAN_PRICES } from '../config/plans.js';

const router = express.Router();

async function ensureTenantPlanLimits(tenantDoc) {
    if (!tenantDoc) return null;
    if (!hasPlanLimitMismatch(tenantDoc.plan, tenantDoc.limits)) return tenantDoc;

    tenantDoc.limits = getPlanLimits(tenantDoc.plan);
    await tenantDoc.save();
    return tenantDoc;
}

router.get('/', auth, requirePermission('billing.view'), async (req, res) => {
    const tenant = await Tenant.findById(req.tenantId);
    await ensureTenantPlanLimits(tenant);
    const invoices = await Invoice.find({ tenant: req.tenantId }).sort({ createdAt: -1 }).limit(12);
    const planConfig = getPlanConfig(tenant.plan);
    res.json({
        success: true,
        data: {
            plan: tenant.plan,
            limits: tenant.limits,
            usage: tenant.usage,
            invoices,
            price: planConfig.price,
            plans: getPlanPublicCatalog(),
        }
    });
});

router.post('/change-plan', auth, requirePermission('billing.manage'), async (req, res) => {
    try {
        const requestedPlan = req.body?.plan || req.body?.planId;
        if (!isValidPlan(requestedPlan)) {
            return res.status(400).json({ success: false, error: 'Invalid plan' });
        }

        const tenant = await Tenant.findById(req.tenantId);
        const oldPlan = tenant.plan;
        tenant.plan = requestedPlan;
        await tenant.save();

        if (PLAN_PRICES[requestedPlan] > 0) {
            await Invoice.create({
                tenant: req.tenantId,
                amount: PLAN_PRICES[requestedPlan],
                plan: requestedPlan,
                status: 'paid',
                description: `Plan change to ${requestedPlan}`,
                period: { start: new Date(), end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
                paymentMethod: { type: 'card', last4: '4242', brand: 'Visa' },
            });
        }

        await ActivityLog.create({
            user: { id: req.user._id, name: req.user.name, email: req.user.email },
            tenant: req.tenantId,
            action: 'billing.changePlan',
            entityType: 'billing',
            details: { oldPlan, newPlan: requestedPlan, amount: PLAN_PRICES[requestedPlan] },
            ipAddress: req.ip,
        });

        res.json({
            success: true,
            data: {
                plan: tenant.plan,
                limits: tenant.limits,
                usage: tenant.usage,
                price: PLAN_PRICES[tenant.plan],
                plans: getPlanPublicCatalog(),
            }
        });
    } catch {
        res.status(500).json({ success: false, error: 'Plan change failed' });
    }
});

export default router;
