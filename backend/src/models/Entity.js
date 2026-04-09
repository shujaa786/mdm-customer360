
const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema({
  goldenId: { type: String, default: null },
  sourceId: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  sourceSystem: String,
  rawData: Object,
  isGolden: { type: Boolean, default: false }
});

module.exports = mongoose.model('Entity', EntitySchema);