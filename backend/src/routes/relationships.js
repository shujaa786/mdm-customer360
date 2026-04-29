const express = require('express');
const router = express.Router();
const Relationship = require('../models/Relationship');

router.get('/relationships', async (req, res) => {
  try {
    const entityId = req.query.entityId;
    const filter = entityId
      ? {
          $or: [
            { fromId: entityId },
            { toId: entityId }
          ]
        }
      : {};

    const relationships = await Relationship.find(filter).lean().exec();
    res.json({ success: true, relationships });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
