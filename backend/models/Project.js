import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    tenantId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:            { type: String, required: true, trim: true },
    description:     { type: String, default: '' },
    activeVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'VersionHistory', default: null },
    status:          { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true }
);

// Index for fast lookups
ProjectSchema.index({ tenantId: 1, userId: 1 });

const Project = mongoose.model('Project', ProjectSchema);
export default Project;
