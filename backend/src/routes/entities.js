const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const { createGoldenRecords } = require('../services/goldenRecordService');

router.get('/', async (req, res) => {
  try {
    const entities = await Entity.find().sort({ isGolden: -1 });
    res.json({ success: true, count: entities.length, entities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/create-golden', async (req, res) => {
  try {
    const result = await createGoldenRecords();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;