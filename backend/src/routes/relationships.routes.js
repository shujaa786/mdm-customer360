const express = require('express');
const router = express.Router();

const relationshipsController = require('../http/controllers/relationships.controller');

router.get('/relationships', relationshipsController.list);
router.get('/graph', relationshipsController.graph);

module.exports = router;

