import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    role:     { type: String, enum: ['admin', 'editor', 'viewer'], default: 'editor' },
    avatar:   { type: String, default: null },
  },
  { timestamps: true }
);

// Compound index: ensure unique email within tenant (not globally unique)
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });

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
