const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
  fromId: String,
  toId: String,
  type: { type: String, enum: ['HOUSEHOLD', 'EMPLOYER', 'INTERACTION'] }
});

module.exports = mongoose.model('Relationship', RelationshipSchema);