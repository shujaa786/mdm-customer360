const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const { findPotentialMatches } = require('../services/matchingService');
const { createGoldenRecordForPair } = require('../services/goldenRecordService');

const toPreview = (entity) => ({
  _id: entity._id?.toString?.() || '',
  firstName: entity.firstName || entity.rawData?.first_name || '',
  lastName: entity.lastName || entity.rawData?.last_name || '',
  email: entity.email || entity.rawData?.email || '',
  phone: entity.phone || entity.rawData?.phone || '',
  sourceSystem: entity.sourceSystem,
  isGolden: entity.isGolden
});

const isIdOnlyMatch = (match) => typeof match?.entity1 === 'string' || typeof match?.entity2 === 'string';

router.post('/match', async (req, res) => {
  try {
    let matches = await findPotentialMatches(Entity);

    // Backward-compatible normalization: if any service/deploy still returns ID-only matches,
    // resolve IDs to preview objects so frontend always receives rich match cards.
    if (matches.some(isIdOnlyMatch)) {
      const ids = new Set();
      for (const m of matches) {
        if (typeof m.entity1 === 'string') ids.add(m.entity1);
        if (typeof m.entity2 === 'string') ids.add(m.entity2);
      }

      const entities = await Entity.find({ _id: { $in: Array.from(ids) } }).lean().exec();
      const byId = new Map(entities.map((e) => [e._id.toString(), toPreview(e)]));

      matches = matches.map((m) => ({
        ...m,
        entity1: typeof m.entity1 === 'string' ? (byId.get(m.entity1) || { _id: m.entity1, firstName: '', lastName: '', email: '', phone: '', sourceSystem: '', isGolden: false }) : m.entity1,
        entity2: typeof m.entity2 === 'string' ? (byId.get(m.entity2) || { _id: m.entity2, firstName: '', lastName: '', email: '', phone: '', sourceSystem: '', isGolden: false }) : m.entity2
      }));
    }

    res.json({
      success: true,
      matchCount: matches.length,
      matches: matches
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/merge', async (req, res) => {
  try {
    const { entity1Id, entity2Id } = req.body || {};

    if (!entity1Id || !entity2Id) {
      return res.status(400).json({
        success: false,
        error: 'entity1Id and entity2Id are required'
      });
    }

    const result = await createGoldenRecordForPair(entity1Id, entity2Id);

    if (!result.success) {
      if (result.conflict) {
        return res.status(409).json(result);
      }
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;