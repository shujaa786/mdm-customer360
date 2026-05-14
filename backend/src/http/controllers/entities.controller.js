const Entity = require('../../models/Entity');
const Relationship = require('../../models/Relationship');
const { createGoldenRecords } = require('../../services/goldenRecordService');
const asyncHandler = require('../../middleware/asyncHandler');
const api = require('../../utils/apiResponse');

async function list(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

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

  return api.sendSuccess(res, {
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
}

async function search(req, res) {

  const q = req.query.q || '';

  const regex = new RegExp(q, 'i');

  const entities = await Entity.find({
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex }
    ]
  })
    .limit(50)
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  return api.sendSuccess(res, {
    entities
  });
}

async function getById(req, res) {
  const entity = await Entity.findById(req.params.id).lean().exec();
  if (!entity) return api.sendNotFound(res, 'Entity not found');

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

  return api.sendSuccess(res, { entity, linkedRecords, relationships });
}

async function createGolden(req, res) {
  const result = await createGoldenRecords();
  return api.sendSuccess(res, result);
}

module.exports = {
  list: asyncHandler(list),
  search: asyncHandler(search),
  getById: asyncHandler(getById),
  createGolden: asyncHandler(createGolden)
};

