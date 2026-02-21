import mongoose from 'mongoose';

// ── Sub-document: Service ────────────────────────────────────────────────────
const ServiceSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price:       { type: Number, default: 0 },
    icon:        { type: String, default: '' },
  },
  { timestamps: true }
);

// ── Sub-document: Image ──────────────────────────────────────────────────────
const ImageSchema = new mongoose.Schema(
  {
    url:        { type: String, required: true },
    alt:        { type: String, default: 'Image' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ── Main Branding Schema ─────────────────────────────────────────────────────
const BrandingSchema = new mongoose.Schema(
  {
    tenantId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true, index: true },
    companyName:        { type: String, default: '' },
    companyDescription: { type: String, default: '' },
    logo:               { type: String, default: null },
    favicon:            { type: String, default: null },
    // New field names for clearer semantics
    bgColor:            { type: String, default: '#1a1a2e' },
    textColor:          { type: String, default: '#111111' },
    primaryColor:       { type: String, default: '#8b5cf6' },
    secondaryColor:     { type: String, default: '#6d28d9' },
    accentColor:        { type: String, default: '#06b6d4' },
    // Keep legacy field for backward compatibility
    backgroundColor:    { type: String, default: '#1a1a2e' },
    fontHeading:        { type: String, default: 'Outfit' },
    fontBody:           { type: String, default: 'Inter' },
    images:             [ImageSchema],
    services:           [ServiceSchema],
  },
  { timestamps: true }
);

const Branding = mongoose.model('Branding', BrandingSchema);
export default Branding;
