import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logo:        { type: String, default: null },
    plan:        { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Owner may be assigned after tenant creation during registration flow,
    // so make this optional to avoid validation errors when creating the
    // tenant document before the owner user exists.
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    branding: {
      primaryColor: { type: String, default: '#8b5cf6' },
      secondaryColor: { type: String, default: '#06b6d4' },
      accentColor: { type: String, default: '#f59e0b' },
      headingFont: { type: String, default: 'Outfit' },
      bodyFont: { type: String, default: 'Inter' },
      logo: { type: String, default: '' },
    },
    domains: [{
      domain: String,
      verified: { type: Boolean, default: false },
      ssl: { type: Boolean, default: false },
      primary: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now },
    }],
    usage: {
      websites: { type: Number, default: 0 },
      pages: { type: Number, default: 0 },
      aiGenerations: { type: Number, default: 0 },
      storage: { type: Number, default: 0 },
    },
    limits: {
      websites: { type: Number, default: 1 },
      pages: { type: Number, default: 5 },
      aiGenerations: { type: Number, default: 10 },
      storage: { type: Number, default: 100 },
      customDomains: { type: Number, default: 0 },
      teamMembers: { type: Number, default: 1 },
    },
    status:      { type: String, enum: ['active', 'inactive', 'suspended', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

// Index for fast lookups
TenantSchema.index({ ownerUserId: 1 });

TenantSchema.pre('validate', function (next) {
  if (!this.ownerUserId && this.owner) this.ownerUserId = this.owner;
  if (!this.owner && this.ownerUserId) this.owner = this.ownerUserId;
  next();
});

TenantSchema.pre('save', function (next) {
  const planLimits = {
    free: { websites: 1, pages: 5, aiGenerations: 10, storage: 100, customDomains: 0, teamMembers: 1 },
    starter: { websites: 3, pages: 20, aiGenerations: 50, storage: 500, customDomains: 1, teamMembers: 3 },
    professional: { websites: 10, pages: 100, aiGenerations: 500, storage: 5000, customDomains: 5, teamMembers: 10 },
    enterprise: { websites: -1, pages: -1, aiGenerations: -1, storage: -1, customDomains: -1, teamMembers: -1 },
  };

  if (this.isModified('plan')) {
    this.limits = planLimits[this.plan] || planLimits.free;
  }
  next();
});

const Tenant = mongoose.model('Tenant', TenantSchema);
export default Tenant;
