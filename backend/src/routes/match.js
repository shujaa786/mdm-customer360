const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const { findPotentialMatches } = require('../services/matchingService');

router.post('/match', async (req, res) => {
  try {
    const matches = await findPotentialMatches(Entity);

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

module.exports = router;