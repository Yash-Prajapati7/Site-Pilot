/**
 * api.js — Frontend service layer that calls the real Node/Express backend.
 * All functions are async and return { ok, ...data } or { ok: false, error }.
 * Pages that previously called these synchronously must now await them.
 */

import apiClient from './apiClient';
import {
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PLAN_USAGE,
  PLAN_DEFINITIONS,
  getPlanById,
  normalizePlanLimits,
  normalizePlanUsage,
  toLegacyPlanLimits,
} from '../lib/plans';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Read the stored user object (includes tenantId). */
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Read the stored auth token. */
function getStoredToken() {
  return localStorage.getItem('authToken');
}

/** Decode JWT payload (base64url). */
function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Get the tenant ID for the current user. Prefer the JWT payload to avoid mismatches. */
export function getTenantId() {
  const tokenPayload = decodeJwtPayload(getStoredToken());
  if (tokenPayload?.tenantId) return String(tokenPayload.tenantId);
  return getStoredUser()?.tenantId || null;
}

// ─── Branding cache helpers ────────────────────────────────────────────────
const BRANDING_CACHE_PREFIX = 'brandingCache:';

function readBrandingCache(tenantId) {
  if (!tenantId) return null;
  try {
    const raw = localStorage.getItem(`${BRANDING_CACHE_PREFIX}${tenantId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeBrandingCache(tenantId, branding) {
  if (!tenantId || !branding) return;
  try {
    localStorage.setItem(`${BRANDING_CACHE_PREFIX}${tenantId}`, JSON.stringify(branding));
  } catch {
    // ignore storage errors
  }
}

function patchBrandingCache(tenantId, partial) {
  if (!tenantId || !partial) return;
  const current = readBrandingCache(tenantId) || {};
  writeBrandingCache(tenantId, { ...current, ...partial });
}

function normalizeTenant(tenantPayload) {
  const tenantId = String(tenantPayload?.id || tenantPayload?._id || '');
  const planId = tenantPayload?.plan || 'free';
  const planConfig = getPlanById(planId);
  const incomingLimits = normalizePlanLimits(tenantPayload?.limits || DEFAULT_PLAN_LIMITS);
  const expectedLimits = normalizePlanLimits(planConfig.limits || DEFAULT_PLAN_LIMITS);
  const hasLimitMismatch = Object.keys(expectedLimits).some(
    (key) => Number(incomingLimits[key]) !== Number(expectedLimits[key])
  );
  const limits = hasLimitMismatch ? expectedLimits : incomingLimits;
  const usage = normalizePlanUsage(tenantPayload?.usage || DEFAULT_PLAN_USAGE);

  return {
    id: tenantId,
    name: tenantPayload?.name || '',
    slug: tenantPayload?.slug || '',
    plan: planId,
    planPrice: Number.isFinite(Number(tenantPayload?.planPrice))
      ? Number(tenantPayload.planPrice)
      : planConfig.price,
    limits,
    usage,
    branding: tenantPayload?.branding || {
      primaryColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      logo: '',
    },
    // Keep old field for pages that still read tenant.planLimits.
    planLimits: toLegacyPlanLimits(limits),
    members: Array.isArray(tenantPayload?.members) ? tenantPayload.members : [],
  };
}

function normalizeAuthenticatedUser(payload) {
  const tenant = normalizeTenant(payload?.tenant || {});
  const rawUser = payload?.user || {};
  const userId = String(rawUser.id || rawUser._id || '');

  return {
    ...rawUser,
    id: userId,
    tenantId: tenant.id || String(rawUser.tenantId || ''),
    tenant,
  };
}

/**
 * Normalise a backend Project document into the shape the existing UI expects
 * (which uses "website" terminology).
 */
function normalizeProject(proj) {
  if (!proj) return null;
  const id = String(proj._id || proj.id);
  const slug = proj.name?.toLowerCase().replace(/\s+/g, '-') || id;
  // If we have generatedHTML, construct a fake activeVersion to match Builder's expectations
  const hasHTML = proj.generatedHTML && proj.generatedHTML.length > 0;
  return {
    id,
    _id: id,
    name: proj.name || 'Untitled',
    description: proj.description || '',
    status: proj.status || 'draft',
    slug,
    domain: {
      subdomain: `${slug}.sitepilot.app`,
      custom: null,
      verified: false,
      ssl: false,
    },
    settings: {
      favicon: '',
      seo: { title: proj.name, description: proj.description || '' },
    },
    pageCount: hasHTML ? 1 : 0,
    createdAt: proj.createdAt,
    updatedAt: proj.updatedAt,
    publishedAt: proj.publishedAt || null,
    activeVersionId: hasHTML ? proj.currentVersion : null,
    activeVersion: hasHTML ? {
      versionNumber: proj.currentVersion || 1,
      htmlCode: proj.generatedHTML
    } : null,
  };
}


// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * Login with email + password.
 * Returns { ok, user, tenant, token } or { ok: false, error }.
 */
export async function loginUser(email, password) {
  if (!email || !password) return { ok: false, error: 'Email and password are required' };
  try {
    const { data: resData } = await apiClient.post('/auth/login', { email, password });
    const payload = resData?.data ?? resData;
    const user = normalizeAuthenticatedUser(payload);
    return { ok: true, user, tenant: user.tenant, token: payload.token };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Login failed' };
  }
}

/**
 * Register a new tenant + owner account.
 * Returns { ok, user, tenant, token } or { ok: false, error }.
 */
export async function registerTenant({ ownerName, ownerEmail, password, ownerPassword, tenantName, slug, plan }) {
  try {
    const { data: resData } = await apiClient.post('/auth/register', {
      tenantName,
      tenantSlug: slug || tenantName.toLowerCase().replace(/\s+/g, '-'),
      ownerName,
      ownerEmail,
      password: password || ownerPassword || 'demo123',
      plan: plan || 'free',
    });
    const payload = resData?.data ?? resData;
    const user = normalizeAuthenticatedUser(payload);
    return { ok: true, user, tenant: user.tenant, token: payload.token };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Registration failed' };
  }
}

/** Clear local session — no backend call required for JWT. */
export function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  return { ok: true };
}

/**
 * Verify the stored token and fetch the current user + tenant.
 * Returns { user } where user has a .tenant property, or { user: null }.
 */
export async function fetchCurrentUser() {
  try {
    const { data: resData } = await apiClient.get('/auth/me');
    const payload = resData?.data ?? resData;
    const user = normalizeAuthenticatedUser(payload);
    if (!user.id) return { user: null };
    return { user };
  } catch {
    return { user: null };
  }
}

// ─── Projects (mapped to "websites" in the UI) ────────────────────────────────

/** List all projects belonging to the current user. */
export async function fetchWebsites() {
  const tenantId = getTenantId();
  if (!tenantId) return { websites: [], error: 'Unauthorized' };
  try {
    const { data: resData } = await apiClient.get(`/websites`);
    return { websites: (resData.data || []).map(normalizeProject) };
  } catch (err) {
    return { websites: [], error: err.response?.data?.error || 'Failed to load websites' };
  }
}

/** Fetch a single project by ID. */
export async function fetchWebsite(projectId) {
  const tenantId = getTenantId();
  if (!tenantId) return { website: null };
  try {
    const { data: resData } = await apiClient.get(`/websites/${projectId}`);
    return { website: normalizeProject(resData.data) };
  } catch {
    return { website: null };
  }
}

/** Create a new project (returns normalised "website" object). */
export async function createWebsite({ name, description = '' }) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    const { data: resData } = await apiClient.post(`/websites`, { name, description, businessType: 'general' });
    return { ok: true, website: normalizeProject(resData.data) };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Failed to create website' };
  }
}

/** Update project metadata (name, description, status). */
export async function modifyWebsite(id, updates) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    const { data: resData } = await apiClient.put(`/websites/${id}`, updates);
    return { ok: true, website: normalizeProject(resData.data) };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Update failed' };
  }
}

/** Publish a project (set status = published). */
export async function deployWebsite(id) {
  return modifyWebsite(id, { status: 'published' });
}

/** Permanently delete a project and all its versions. */
export async function removeWebsiteById(id) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    await apiClient.delete(`/websites/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Delete failed' };
  }
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function normalizePage(page) {
  if (!page) return null;
  const id = String(page._id || page.id);
  return {
    ...page,
    id,
    _id: id,
    title: page.title || 'Untitled Page',
    slug: page.slug || '',
    components: page.components || [],
    version: page.version || 1,
    status: page.status || 'draft',
  };
}

export async function fetchPages(websiteId) {
  const tenantId = getTenantId();
  if (!tenantId) return { pages: [] };
  try {
    const { data } = await apiClient.get('/pages', {
      params: websiteId ? { websiteId } : undefined,
    });
    return { pages: (data?.data || []).map(normalizePage) };
  } catch {
    return { pages: [] };
  }
}

export async function createPage(payload) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    const { data } = await apiClient.post('/pages', payload);
    return { ok: true, page: normalizePage(data?.data) };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Failed to create page' };
  }
}

export async function modifyPage(id, updates) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    const { data } = await apiClient.put(`/pages/${id}`, updates);
    return { ok: true, page: normalizePage(data?.data) };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Failed to update page' };
  }
}

export async function removePageById(id) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    await apiClient.delete(`/pages/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Failed to delete page' };
  }
}

// ─── AI Website Generation ────────────────────────────────────────────────────

/**
 * Generate a website via Gemini on the backend and save as a new version.
 * @param {string} prompt - User's generation/modification prompt
 * @param {array} history - Edit history (unused in backend currently)
 * @param {string} projectId - Project ID
 * @param {string} previousHtml - Previous version's HTML for styling consistency
 * Returns { ok, html, versionNumber, usage } or { ok: false, error }.
 */
export async function generateAIWebsite(prompt, history = [], projectId, previousHtml = '') {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  if (!projectId) return { ok: false, error: 'Project ID is required for generation' };

  try {
    const { data: resData } = await apiClient.post(
      `/ai/generate`,
      { prompt, previousHtml, websiteId: projectId },
    );

    // Backend returns { ok: true, version: { versionNumber, htmlCode } }
    const version = resData.version;
    return {
      ok: true,
      html: version.htmlCode || '',
      versionNumber: version.versionNumber,
      businessType: 'ai-generated',
      businessName: '',
      usage: resData.usage || {
        used: Number(resData?.tenant?.usage?.aiGenerations || version.versionNumber || 0),
        limit: Number(resData?.tenant?.limits?.aiGenerations || DEFAULT_PLAN_LIMITS.aiGenerations),
      },
      generation: resData.generation || {
        target: 'frontend',
        provider: 'gemini',
        model: 'gemini-3-flash-preview',
      },
    };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'AI generation failed' };
  }
}

export async function generateBackendForWebsite(projectId) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  if (!projectId) return { ok: false, error: 'Project ID is required' };

  try {
    const { data: resData } = await apiClient.post(`/site-backends/${projectId}/generate`);
    return {
      ok: true,
      backend: resData.data,
      generation: resData.generation || {
        target: 'backend',
        provider: 'groq',
        model: 'openai/gpt-oss-120b',
      },
    };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Backend generation failed' };
  }
}

// ─── Version History ──────────────────────────────────────────────────────────

export async function fetchVersions(projectId) {
  const tenantId = getTenantId();
  if (!tenantId || !projectId) return { versions: [] };
  try {
    const { data: resData } = await apiClient.get(`/websites/${projectId}/versions`);
    return { versions: resData.data || [] };
  } catch {
    return { versions: [] };
  }
}

export async function rollbackVersion(projectId, versionId) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    const { data: resData } = await apiClient.post(
      `/websites/${projectId}/versions/${versionId}/restore`,
    );
    return { ok: true, version: resData.data };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Rollback failed' };
  }
}

// ─── Branding ─────────────────────────────────────────────────────────────────

/** Fetch branding for the current tenant. */
export async function fetchBranding() {
  const tenantId = getTenantId();
  if (!tenantId) return { branding: null };
  const cached = readBrandingCache(tenantId);
  try {
    const { data } = await apiClient.get(`/branding/${tenantId}`);
    writeBrandingCache(tenantId, data.branding);
    return { branding: data.branding };
  } catch {
    return { branding: cached };
  }
}

/**
 * Update branding fields.
 * Accepts a flat object or an object with a `branding` sub-key.
 */
export async function modifyTenant(updates) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };

  // All fields that the Branding page can send
  const BRANDING_KEYS = [
    'brandName', 'brandDescription',
    'companyName', 'companyDescription',
    'primaryColor', 'secondaryColor', 'accentColor',
    'backgroundColor', 'bgColor', 'textColor',
    'fontHeading', 'fontBody',
    'logo', 'services',
  ];

  const payload = {};
  for (const key of BRANDING_KEYS) {
    if (updates[key]           !== undefined) payload[key] = updates[key];
    if (updates.branding?.[key] !== undefined) payload[key] = updates.branding[key];
  }

  try {
    const { data } = await apiClient.put(`/branding/${tenantId}`, payload);
    writeBrandingCache(tenantId, data.branding);
    return { ok: true, branding: data.branding };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Update failed' };
  }
}

/** Upload a logo image. Returns { ok, logo } where logo is the Cloudinary URL. */
export async function uploadLogo(file) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  const formData = new FormData();
  formData.append('file', file);
  try {
    const { data } = await apiClient.post(`/branding/${tenantId}/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    patchBrandingCache(tenantId, { logo: data.logo });
    return { ok: true, logo: data.logo };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Logo upload failed' };
  }
}

/** Upload a gallery/content image. */
export async function uploadImage(file, alt = '') {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  const formData = new FormData();
  formData.append('file', file);
  if (alt) formData.append('alt', alt);
  try {
    const { data } = await apiClient.post(`/branding/${tenantId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { ok: true, image: data.image };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Image upload failed' };
  }
}

// ─── Team Management ──────────────────────────────────────────────────────────

export async function fetchTeam() {
  const tenantId = getTenantId();
  if (!tenantId) return { users: [] };
  try {
    const { data } = await apiClient.get(`/tenants/${tenantId}/users`);
    return { users: data.users || [] };
  } catch {
    return { users: [] };
  }
}

export async function inviteUser({ name, email, password, role = 'editor' }) {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, error: 'Not authenticated' };
  try {
    const { data } = await apiClient.post(`/tenants/${tenantId}/users`, { name, email, password, role });
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Failed to invite user' };
  }
}

// ─── Billing (stubs — no payment backend yet) ─────────────────────────────────

export async function fetchBilling() {
  const tenantId = getTenantId();
  if (!tenantId) return { ok: false, subscription: null, error: 'Not authenticated' };

  try {
    const { data: resData } = await apiClient.get('/billing');
    const payload = resData?.data ?? resData;
    const planId = payload?.plan || 'free';
    const fallbackPlan = getPlanById(planId);
    const incomingLimits = normalizePlanLimits(payload?.limits || DEFAULT_PLAN_LIMITS);
    const expectedLimits = normalizePlanLimits(fallbackPlan.limits || DEFAULT_PLAN_LIMITS);
    const hasLimitMismatch = Object.keys(expectedLimits).some(
      (key) => Number(incomingLimits[key]) !== Number(expectedLimits[key])
    );
    const limits = hasLimitMismatch ? expectedLimits : incomingLimits;
    const usage = normalizePlanUsage(payload?.usage);
    const price = Number.isFinite(Number(payload?.price)) ? Number(payload.price) : fallbackPlan.price;
    const invoices = Array.isArray(payload?.invoices) ? payload.invoices : [];

    const payments = invoices.map((invoice) => {
      const createdAt = invoice?.createdAt ? new Date(invoice.createdAt) : new Date();
      const brand = invoice?.paymentMethod?.brand || 'Card';
      const last4 = invoice?.paymentMethod?.last4 ? ` •••• ${invoice.paymentMethod.last4}` : '';
      return {
        date: createdAt.toLocaleDateString('en-IN'),
        amount: Number(invoice?.amount || 0),
        method: `${brand}${last4}`,
        status: invoice?.status || 'paid',
      };
    });

    const renewalDate = invoices[0]?.period?.end
      ? new Date(invoices[0].period.end).toLocaleDateString('en-IN')
      : null;

    const plans = Array.isArray(payload?.plans) && payload.plans.length > 0
      ? payload.plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: Number(plan.price) || 0,
        features: Array.isArray(plan.features) ? plan.features : [],
        limits: normalizePlanLimits(plan.limits),
      }))
      : PLAN_DEFINITIONS.map((plan) => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        features: [...plan.features],
        limits: normalizePlanLimits(plan.limits),
      }));

    return {
      ok: true,
      plans,
      subscription: {
        plan: planId,
        planName: fallbackPlan.name,
        price,
        renewalDate,
        limits,
        usage,
        payments,
      },
    };
  } catch (err) {
    return {
      ok: false,
      subscription: null,
      error: err.response?.data?.error || 'Failed to load billing information',
    };
  }
}

export async function changePlan({ planId }) {
  if (!planId) return { ok: false, error: 'Plan is required' };
  try {
    const { data: resData } = await apiClient.post('/billing/change-plan', { plan: planId });
    const payload = resData?.data ?? resData;
    return {
      ok: true,
      plan: payload?.plan || planId,
      limits: normalizePlanLimits(payload?.limits),
      usage: normalizePlanUsage(payload?.usage),
      price: Number(payload?.price || getPlanById(payload?.plan || planId).price),
      plans: Array.isArray(payload?.plans) ? payload.plans : [],
    };
  } catch (err) {
    return { ok: false, error: err.response?.data?.error || 'Failed to change plan' };
  }
}

// ─── Legacy AI helper stubs (keep imports working) ────────────────────────────

export function generateAILayout()      { return { ok: true, result: null }; }
export function generateAIComponent()   { return { ok: true, result: null }; }
export function suggestAISEO()          { return { ok: true, result: null }; }
export function checkAIAccessibility()  { return { ok: true, result: null }; }

