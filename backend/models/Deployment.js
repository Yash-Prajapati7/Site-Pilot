import mongoose from 'mongoose';
import { ALL_DEPLOYMENT_STATUSES, DEPLOYMENT_STATUS, ALL_DEPLOYMENT_ENVS, DEPLOYMENT_ENV } from '../config/constants.js';

const deploymentSchema = new mongoose.Schema({
    website: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    deployedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    version: { type: Number, required: true },
    status: { type: String, enum: ALL_DEPLOYMENT_STATUSES, default: DEPLOYMENT_STATUS.PENDING },
    environment: { type: String, enum: ALL_DEPLOYMENT_ENVS, default: DEPLOYMENT_ENV.PRODUCTION },
    url: { type: String, default: '' },
    buildTime: { type: Number, default: 0 },
    changelog: { type: String, default: '' },
    rollbackFrom: { type: Number },
}, { timestamps: true });

deploymentSchema.index({ website: 1, createdAt: -1 });

export default mongoose.model('Deployment', deploymentSchema);
