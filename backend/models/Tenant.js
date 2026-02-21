import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logo:        { type: String, default: null },
    // Owner may be assigned after tenant creation during registration flow,
    // so make this optional to avoid validation errors when creating the
    // tenant document before the owner user exists.
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// Index for fast lookups
TenantSchema.index({ ownerUserId: 1 });

const Tenant = mongoose.model('Tenant', TenantSchema);
export default Tenant;
