// ══════════════════════════════════════════════════════════════════════════════
// Application-wide Constants & Enums
// ══════════════════════════════════════════════════════════════════════════════

// JavaScript Typeof Primitives
export const JS_TYPES = Object.freeze({
  FUNCTION: 'function',
  STRING: 'string',
  OBJECT: 'object',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  UNDEFINED: 'undefined',
});

// User Roles
export const ROLES = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

export const ADMIN_ROLES = Object.freeze([ROLES.OWNER, ROLES.ADMIN]);

export const DEFAULT_USER_ROLE = ROLES.EDITOR;

// Role Hierarchies
export const ROLE_HIERARCHY = Object.freeze({
  [ROLES.OWNER]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.EDITOR]: 2,
  [ROLES.DEVELOPER]: 1,
  [ROLES.VIEWER]: 0,
});

export const ROLE_LEVEL = Object.freeze({
  [ROLES.OWNER]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.EDITOR]: 2,
  [ROLES.VIEWER]: 1,
});

// User Statuses
export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
});

export const ALL_USER_STATUSES = Object.freeze(Object.values(USER_STATUS));

// Tenant Statuses
export const TENANT_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
});

export const ALL_TENANT_STATUSES = Object.freeze(Object.values(TENANT_STATUS));

// Content / Website / Page Statuses
export const CONTENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

export const ALL_CONTENT_STATUSES = Object.freeze(Object.values(CONTENT_STATUS));

// Deployment Statuses & Environments
export const DEPLOYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  BUILDING: 'building',
  DEPLOYING: 'deploying',
  LIVE: 'live',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
});

export const ALL_DEPLOYMENT_STATUSES = Object.freeze(Object.values(DEPLOYMENT_STATUS));

export const DEPLOYMENT_ENV = Object.freeze({
  PREVIEW: 'preview',
  PRODUCTION: 'production',
});

export const ALL_DEPLOYMENT_ENVS = Object.freeze(Object.values(DEPLOYMENT_ENV));

// Invoice Statuses & Billing
export const INVOICE_STATUS = Object.freeze({
  PAID: 'paid',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

export const ALL_INVOICE_STATUSES = Object.freeze(Object.values(INVOICE_STATUS));

export const DEFAULT_PLAN = 'free';

export const PAYMENT_METHOD_TYPE = Object.freeze({
  CARD: 'card',
});

// Activity Log Entity Types
export const ENTITY_TYPE = Object.freeze({
  WEBSITE: 'website',
  PAGE: 'page',
  COMPONENT: 'component',
  DEPLOYMENT: 'deployment',
  USER: 'user',
  TENANT: 'tenant',
  BILLING: 'billing',
  DOMAIN: 'domain',
});

export const ALL_ENTITY_TYPES = Object.freeze(Object.values(ENTITY_TYPE));

// Activity Log Actions
export const ACTIVITY_ACTION = Object.freeze({
  PAGE_CREATE: 'page.create',
  PAGE_UPDATE: 'page.update',
  PAGE_DELETE: 'page.delete',
  WEBSITE_CREATE: 'website.create',
  WEBSITE_UPDATE: 'website.update',
  WEBSITE_RESTORE_VERSION: 'website.restoreVersion',
  TEAM_INVITE: 'team.invite',
  TEAM_CHANGE_ROLE: 'team.changeRole',
  TEAM_REMOVE: 'team.remove',
  DEPLOY_CREATE: 'deploy.create',
  BILLING_CHANGE_PLAN: 'billing.changePlan',
  AI_GENERATE: 'ai.generate',
});

export const ALL_ACTIVITY_ACTIONS = Object.freeze(Object.values(ACTIVITY_ACTION));

// Generation Modes
export const GENERATION_MODE = Object.freeze({
  PREBUILT: 'prebuilt',
  CUSTOM: 'custom',
  PLAIN: 'plain',
});

export const ALL_GENERATION_MODES = Object.freeze(Object.values(GENERATION_MODE));

// AI Model & Provider Configuration
export const AI_CONFIG = Object.freeze({
  TARGET: 'frontend',
  PROVIDER: 'vercel-ai',
  MODEL: 'meta/muse-spark-1.3-contributor',
  REASONING: 'high',
});

// Auth & Security Constants
export const AUTH_CONSTANTS = Object.freeze({
  TOKEN_EXPIRY: '7d',
  AUTH_HEADER_PREFIX: 'Bearer ',
});

// Granular RBAC Permissions
export const PERMISSIONS = Object.freeze({
  'website.create': [ROLES.OWNER, ROLES.ADMIN],
  'website.edit': [ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR],
  'website.delete': [ROLES.OWNER, ROLES.ADMIN],
  'website.publish': [ROLES.OWNER, ROLES.ADMIN],
  'page.create': [ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR],
  'page.edit': [ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR],
  'page.delete': [ROLES.OWNER, ROLES.ADMIN],
  'page.publish': [ROLES.OWNER, ROLES.ADMIN],
  'ai.generate': [ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR, ROLES.DEVELOPER],
  'team.invite': [ROLES.OWNER, ROLES.ADMIN],
  'team.remove': [ROLES.OWNER, ROLES.ADMIN],
  'team.changeRole': [ROLES.OWNER, ROLES.ADMIN],
  'billing.view': [ROLES.OWNER, ROLES.ADMIN],
  'billing.manage': [ROLES.OWNER, ROLES.ADMIN],
  'domain.manage': [ROLES.OWNER, ROLES.ADMIN],
  'branding.manage': [ROLES.OWNER, ROLES.ADMIN],
  'analytics.view': [ROLES.OWNER, ROLES.ADMIN, ROLES.EDITOR],
  'deploy.create': [ROLES.OWNER, ROLES.ADMIN],
  'deploy.rollback': [ROLES.OWNER, ROLES.ADMIN],
  'settings.manage': [ROLES.OWNER, ROLES.ADMIN],
});
