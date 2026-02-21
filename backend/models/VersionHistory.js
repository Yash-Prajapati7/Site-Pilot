import mongoose from 'mongoose';

const VersionHistorySchema = new mongoose.Schema(
  {
    tenantId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    projectId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    versionNumber: { type: Number, required: true },
    userPrompt:    { type: String, required: true },
    htmlCode:      { type: String, required: true },

    // Snapshot of branding at generation time (immutable historical record)
    brandingSnapshot: {
      companyName:   String,
      logo:          String,
      primaryColor:  String,
      secondaryColor:String,
      accentColor:   String,
      fontHeading:   String,
      fontBody:      String,
      services:      [{ name: String, description: String, price: Number }],
      images:        [String],
    },

    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  },
  { timestamps: true }
);

// Compound index for fast lookups: latest versions per project
VersionHistorySchema.index({ projectId: 1, versionNumber: -1 });

const VersionHistory = mongoose.model('VersionHistory', VersionHistorySchema);
export default VersionHistory;
