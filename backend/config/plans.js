export const PLAN_CATALOG = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '1 Website',
      '5 Pages',
      '100MB Storage',
      '10 AI Generations/mo',
      'Platform Subdomain',
    ],
    limits: {
      websites: 1,
      pages: 5,
      aiGenerations: 10,
      storage: 100,
      customDomains: 0,
      teamMembers: 1,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 999,
    features: [
      '3 Websites',
      '20 Pages',
      '500MB Storage',
      '50 AI Generations/mo',
      '1 Custom Domain',
      '3 Team Members',
    ],
    limits: {
      websites: 3,
      pages: 20,
      aiGenerations: 50,
      storage: 500,
      customDomains: 1,
      teamMembers: 3,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 2999,
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
    limits: {
      websites: 10,
      pages: 100,
      aiGenerations: 500,
      storage: 5000,
      customDomains: 5,
      teamMembers: 10,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999,
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
    limits: {
      websites: -1,
      pages: -1,
      aiGenerations: -1,
      storage: -1,
      customDomains: -1,
      teamMembers: -1,
    },
  },
};

export const PLAN_IDS = Object.keys(PLAN_CATALOG);

export const PLAN_PRICES = Object.fromEntries(
  PLAN_IDS.map((planId) => [planId, PLAN_CATALOG[planId].price])
);

export const PLAN_LIMITS = Object.fromEntries(
  PLAN_IDS.map((planId) => [planId, PLAN_CATALOG[planId].limits])
);

export function isValidPlan(plan) {
  return Object.prototype.hasOwnProperty.call(PLAN_CATALOG, plan);
}

export function getPlanConfig(plan) {
  return PLAN_CATALOG[plan] || PLAN_CATALOG.free;
}

export function getPlanLimits(plan) {
  const source = getPlanConfig(plan).limits;
  return {
    websites: source.websites,
    pages: source.pages,
    aiGenerations: source.aiGenerations,
    storage: source.storage,
    customDomains: source.customDomains,
    teamMembers: source.teamMembers,
  };
}

export function hasPlanLimitMismatch(plan, limits = {}) {
  const expected = getPlanLimits(plan);
  return Object.keys(expected).some((key) => Number(limits?.[key]) !== Number(expected[key]));
}

export function getPlanPublicCatalog() {
  return PLAN_IDS.map((planId) => ({
    id: planId,
    name: PLAN_CATALOG[planId].name,
    price: PLAN_CATALOG[planId].price,
    features: [...PLAN_CATALOG[planId].features],
    limits: getPlanLimits(planId),
  }));
}
