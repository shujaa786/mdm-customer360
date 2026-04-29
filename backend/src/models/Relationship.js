const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true, index: true },
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true, index: true },
  type: { type: String, enum: ['HOUSEHOLD', 'EMPLOYER', 'INTERACTION'], required: true }
}, { timestamps: true });

RelationshipSchema.index({ fromId: 1, toId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', RelationshipSchema);