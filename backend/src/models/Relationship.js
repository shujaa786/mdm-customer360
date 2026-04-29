const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true, index: true },
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true, index: true },
  type: { type: String, enum: ['HOUSEHOLD', 'EMPLOYER', 'INTERACTION'], required: true }
}, { timestamps: true });

RelationshipSchema.index({ fromId: 1, toId: 1, type: 1 }, { unique: true });

// Normalize legacy/variant payloads before validation/save.
RelationshipSchema.pre('validate', function normalizeRelationship(next) {
  if (!this.fromId && this.from) this.fromId = this.from;
  if (!this.toId && this.to) this.toId = this.to;
  if (!this.type && this.relationshipType) this.type = this.relationshipType;

  if (typeof this.type === 'string') {
    this.type = this.type.toUpperCase().trim();
  }

  next();
});

RelationshipSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    if (ret._id) ret._id = ret._id.toString();
    if (ret.fromId) ret.fromId = ret.fromId.toString();
    if (ret.toId) ret.toId = ret.toId.toString();
    return ret;
  }
});

module.exports = mongoose.model('Relationship', RelationshipSchema);