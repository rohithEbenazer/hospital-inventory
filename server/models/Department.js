const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  hospitalId:   { type: mongoose.Schema.Types.Mixed, required: true },
  name:         { type: String, required: true, trim: true },
  code:         { type: String, trim: true },
  type:         { type: String, enum: ['CLINICAL','PARA_CLINICAL','ADMINISTRATIVE','PHARMACY','OT','ICU','EMERGENCY','LAB','RADIOLOGY','OTHER'], default: 'CLINICAL' },
  headId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  warehouseId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }, // department store
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ hospitalId: 1, name: 1 });
departmentSchema.index({ hospitalId: 1, code: 1 });

module.exports = mongoose.model('Department', departmentSchema);
