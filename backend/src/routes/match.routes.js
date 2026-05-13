const express = require('express');
const router = express.Router();

const matchController = require('../http/controllers/match.controller');

router.post('/match', matchController.match);
router.get('/match', matchController.match);
router.post('/merge', matchController.merge);

module.exports = router;

