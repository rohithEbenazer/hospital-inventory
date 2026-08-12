const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
  name: { type: String },
  partNumber: { type: String },
  quantity: { type: Number },
  cost: { type: Number },
}, { _id: false });

const maintenanceTicketSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ticketNumber: { type: String, unique: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalAsset', required: true },
  type: { type: String, enum: ['PREVENTIVE', 'CORRECTIVE', 'BREAKDOWN', 'AMC', 'WARRANTY_CLAIM'], required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  description: { type: String, required: true },
  scheduledDate: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorName: { type: String },
  spareParts: [sparePartSchema],
  laborCost: { type: Number, default: 0 },
  partsCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'PENDING_PARTS', 'COMPLETED', 'CANCELLED'], default: 'OPEN' },
  resolutionNotes: { type: String },
  attachments: [{ url: String, name: String }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

maintenanceTicketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('MaintenanceTicket').countDocuments();
    this.ticketNumber = `MNT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

maintenanceTicketSchema.index({ hospitalId: 1, assetId: 1, status: 1 });

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
