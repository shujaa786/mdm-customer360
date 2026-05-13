const express = require('express');
const router = express.Router();

const ingestController = require('../http/controllers/ingest.controller');

router.post('/ingest', ingestController.ingest);
router.post('/ingest/upload', ingestController.ingestUpload);
router.post('/ingest/url', ingestController.ingestFromUrl);

module.exports = router;

