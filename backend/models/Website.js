import mongoose from 'mongoose';
import { ALL_CONTENT_STATUSES, CONTENT_STATUS } from '../config/constants.js';

const websiteSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ALL_CONTENT_STATUSES, default: CONTENT_STATUS.DRAFT },
    businessType: { type: String, default: 'general' },
    templateId: { type: String, default: null },
    designStyle: { type: String, default: null },
    generatedHTML: { type: String, default: '' },
    settings: {
        favicon: { type: String, default: '' },
        analytics: { type: String, default: '' },
        customCSS: { type: String, default: '' },
        customJS: { type: String, default: '' },
    },
    seo: {
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        keywords: [String],
        ogImage: { type: String, default: '' },
    },
    domain: { type: String, default: '' },
    publishedAt: { type: Date },
    publishedVersion: { type: Number, default: 0 },
    currentVersion: { type: Number, default: 1 },

    chatHistory: [{
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, default: '' },
        ts: { type: Number },
    }],

    promptHistory: [{ prompt: String }],

    versions: [{
        version: { type: Number, required: true },
        html: { type: String, required: true },
        prompt: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        label: { type: String, default: '' },
    }],
}, { timestamps: true });

websiteSchema.index({ tenant: 1, slug: 1 }, { unique: true });

export default mongoose.model('Website', websiteSchema);
