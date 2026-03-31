export const PLAN_DEFINITIONS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    highlight: false,
    limits: {
      websites: 1,
      pages: 5,
      aiGenerations: 10,
      storage: 100,
      customDomains: 0,
      teamMembers: 1,
    },
    features: [
      '1 Website',
      '5 Pages',
      '100MB Storage',
      '10 AI Generations/mo',
      'Platform Subdomain',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 999,
    highlight: false,
    limits: {
      websites: 3,
      pages: 20,
      aiGenerations: 50,
      storage: 500,
      customDomains: 1,
      teamMembers: 3,
    },
    features: [
      '3 Websites',
      '20 Pages',
      '500MB Storage',
      '50 AI Generations/mo',
      '1 Custom Domain',
      '3 Team Members',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 2999,
    highlight: true,
    limits: {
      websites: 10,
      pages: 100,
      aiGenerations: 500,
      storage: 5000,
      customDomains: 5,
      teamMembers: 10,
    },
    features: [
      '10 Websites',
      '100 Pages',
      '5GB Storage',
      '500 AI Generations/mo',
      '5 Custom Domains',
      '10 Team Members',
      'Version History',
      'Collaboration',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
    highlight: false,
    limits: {
      websites: -1,
      pages: -1,
      aiGenerations: -1,
      storage: -1,
      customDomains: -1,
      teamMembers: -1,
    },
    features: [
      'Unlimited Websites',
      'Unlimited Pages',
      'Unlimited Storage',
      'Unlimited AI',
      'Unlimited Domains',
      'Unlimited Team',
      'Priority Support',
      'Custom Integrations',
    ],
  },
];

export const DEFAULT_PLAN_LIMITS = { ...PLAN_DEFINITIONS[0].limits };

export const DEFAULT_PLAN_USAGE = {
  websites: 0,
  pages: 0,
  aiGenerations: 0,
  storage: 0,
};

const PLAN_BY_ID = Object.fromEntries(PLAN_DEFINITIONS.map((plan) => [plan.id, plan]));

export function getPlanById(planId) {
  return PLAN_BY_ID[planId] || PLAN_BY_ID.free;
}

export function normalizePlanLimits(limits = {}) {
  const fallback = DEFAULT_PLAN_LIMITS;
  return {
    websites: Number.isFinite(Number(limits.websites)) ? Number(limits.websites) : fallback.websites,
    pages: Number.isFinite(Number(limits.pages)) ? Number(limits.pages) : fallback.pages,
    aiGenerations: Number.isFinite(Number(limits.aiGenerations)) ? Number(limits.aiGenerations) : fallback.aiGenerations,
    storage: Number.isFinite(Number(limits.storage)) ? Number(limits.storage) : fallback.storage,
    customDomains: Number.isFinite(Number(limits.customDomains)) ? Number(limits.customDomains) : fallback.customDomains,
    teamMembers: Number.isFinite(Number(limits.teamMembers)) ? Number(limits.teamMembers) : fallback.teamMembers,
  };
}

export function normalizePlanUsage(usage = {}) {
  const fallback = DEFAULT_PLAN_USAGE;
  return {
    websites: Number.isFinite(Number(usage.websites)) ? Number(usage.websites) : fallback.websites,
    pages: Number.isFinite(Number(usage.pages)) ? Number(usage.pages) : fallback.pages,
    aiGenerations: Number.isFinite(Number(usage.aiGenerations)) ? Number(usage.aiGenerations) : fallback.aiGenerations,
    storage: Number.isFinite(Number(usage.storage)) ? Number(usage.storage) : fallback.storage,
  };
}

export function toLegacyPlanLimits(limits) {
  return {
    websites: limits.websites,
    pages: limits.pages,
    storage: limits.storage,
    ai: limits.aiGenerations,
    domains: limits.customDomains,
    teamMembers: limits.teamMembers,
  };
}

export function isUnlimited(limit) {
  return Number(limit) === -1;
}
