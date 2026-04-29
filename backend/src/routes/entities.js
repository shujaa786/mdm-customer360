const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const Relationship = require('../models/Relationship');
const { createGoldenRecords } = require('../services/goldenRecordService');

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optimized query: only select needed fields and use lean() for better performance
    const [entities, totalCount] = await Promise.all([
      Entity.find()
        .sort({ isGolden: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Entity.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      entities,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: totalCount,
        recordsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id).lean().exec();
    if (!entity) {
      return res.status(404).json({ success: false, error: 'Entity not found' });
    }

    const linkedFilter = entity.isGolden
      ? {
          $or: [
            { _id: entity._id },
            { _id: { $in: entity.mergedFrom || [] } },
            { goldenId: entity._id }
          ]
        }
      : {
          $or: [
            { _id: entity._id },
            ...(entity.goldenId ? [{ goldenId: entity.goldenId }, { _id: entity.goldenId }] : [])
          ]
        };

    const linkedRecords = await Entity.find(linkedFilter).lean().exec();

    const relatedIds = linkedRecords.map((r) => r._id);
    const relationships = await Relationship.find({
      $or: [
        { fromId: { $in: relatedIds } },
        { toId: { $in: relatedIds } }
      ]
    }).lean().exec();

    return res.json({
      success: true,
      entity,
      linkedRecords,
      relationships
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
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