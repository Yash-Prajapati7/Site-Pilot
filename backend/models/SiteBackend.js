import mongoose from 'mongoose';

const siteBackendSchema = new mongoose.Schema({
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true, unique: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    apiDefinition: {
        type: mongoose.Schema.Types.Mixed,
        default: { endpoints: [], collections: [] },
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    status: { type: String, enum: ['generating', 'active', 'error'], default: 'generating' },
    apiBaseUrl: String,
    lastGenerated: Date,
}, { timestamps: true });

export default mongoose.model('SiteBackend', siteBackendSchema);
