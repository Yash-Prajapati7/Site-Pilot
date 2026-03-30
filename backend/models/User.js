import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    tenant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', index: true },
    role:     { type: String, enum: ['owner', 'admin', 'editor', 'developer', 'viewer'], default: 'editor' },
    avatar:   { type: String, default: null },
    status:   { type: String, enum: ['active', 'invited', 'suspended'], default: 'active' },
    lastLogin:{ type: Date },
  },
  { timestamps: true }
);

// Compound index: ensure unique email within tenant (not globally unique)
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1, tenant: 1 }, { unique: true, sparse: true });

UserSchema.pre('validate', function (next) {
  if (!this.tenant && this.tenantId) this.tenant = this.tenantId;
  if (!this.tenantId && this.tenant) this.tenantId = this.tenant;
  next();
});

// ── Hash password before save ────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Remove password from JSON output ─────────────────────────────────────────
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', UserSchema);
export default User;
