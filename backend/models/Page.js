import mongoose from 'mongoose';
import { ALL_CONTENT_STATUSES, CONTENT_STATUS } from '../config/constants.js';

const pageSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true },
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    components: [{ type: mongoose.Schema.Types.Mixed }],
    generatedHTML: { type: String, default: '' },
    status: { type: String, enum: ALL_CONTENT_STATUSES, default: CONTENT_STATUS.DRAFT },
    version: { type: Number, default: 1 },
    versions: [{
        version: Number,
        components: [mongoose.Schema.Types.Mixed],
        generatedHTML: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
        message: String,
    }],
    seo: {
        title: String,
        description: String,
        keywords: [String],
    },
}, { timestamps: true });

pageSchema.index({ website: 1, slug: 1 }, { unique: true });

export default mongoose.model('Page', pageSchema);
