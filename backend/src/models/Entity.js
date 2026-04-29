
const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  goldenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', default: null, index: true },
  sourceId: { type: String, trim: true, index: true },
  firstName: { type: String, trim: true, default: '' },
  lastName: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '', index: true },
  phone: { type: String, trim: true, default: '', index: true },
  address: { type: String, trim: true, default: '' },
  sourceSystem: { type: String, trim: true, default: 'UNKNOWN', index: true },
  rawData: { type: mongoose.Schema.Types.Mixed, default: {} },
  isGolden: { type: Boolean, default: false, index: true },
  mergedFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }]
}, { timestamps: true });

EntitySchema.index({ sourceSystem: 1, sourceId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Entity', EntitySchema);