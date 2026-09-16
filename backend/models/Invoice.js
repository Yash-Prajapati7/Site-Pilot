import mongoose from 'mongoose';
import { ALL_INVOICE_STATUSES, INVOICE_STATUS, PAYMENT_METHOD_TYPE } from '../config/constants.js';

const invoiceSchema = new mongoose.Schema({
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ALL_INVOICE_STATUSES, default: INVOICE_STATUS.PENDING },
    plan: { type: String, required: true },
    period: {
        start: Date,
        end: Date,
    },
    paymentMethod: {
        type: { type: String, default: PAYMENT_METHOD_TYPE.CARD },
        last4: String,
        brand: String,
    },
    description: { type: String, default: '' },
}, { timestamps: true });

invoiceSchema.index({ tenant: 1, createdAt: -1 });

export default mongoose.model('Invoice', invoiceSchema);
