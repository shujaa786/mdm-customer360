const express = require('express');
const router = express.Router();

const entitiesController = require('../http/controllers/entities.controller');

router.get('/', entitiesController.list);
router.get('/search', entitiesController.search);
router.get('/:id', entitiesController.getById);
router.post('/create-golden', entitiesController.createGolden);

module.exports = router;

