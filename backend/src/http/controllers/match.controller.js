const Entity = require('../../models/Entity');
const { findPotentialMatches } = require('../../services/matchingService');
const { createGoldenRecordForPair } = require('../../services/goldenRecordService');
const asyncHandler = require('../../middleware/asyncHandler');
const api = require('../../utils/apiResponse');

function toPreview(entity) {
  return {
    _id: entity._id?.toString?.() || '',
    firstName: entity.firstName || entity.rawData?.first_name || '',
    lastName: entity.lastName || entity.rawData?.last_name || '',
    email: entity.email || entity.rawData?.email || '',
    phone: entity.phone || entity.rawData?.phone || '',
    sourceSystem: entity.sourceSystem,
    isGolden: entity.isGolden
  };
}

function isIdOnlyMatch(match) {
  return typeof match?.entity1 === 'string' || typeof match?.entity2 === 'string';
}

async function normalizeMatchesIfNeeded(matches) {
  if (!matches.some(isIdOnlyMatch)) return matches;

  const ids = new Set();
  for (const m of matches) {
    if (typeof m.entity1 === 'string') ids.add(m.entity1);
    if (typeof m.entity2 === 'string') ids.add(m.entity2);
  }

  const entities = await Entity.find({ _id: { $in: Array.from(ids) } }).lean().exec();
  const byId = new Map(entities.map((e) => [e._id.toString(), toPreview(e)]));

  return matches.map((m) => ({
    ...m,
    entity1:
      typeof m.entity1 === 'string'
        ? byId.get(m.entity1) || { _id: m.entity1, firstName: '', lastName: '', email: '', phone: '', sourceSystem: '', isGolden: false }
        : m.entity1,
    entity2:
      typeof m.entity2 === 'string'
        ? byId.get(m.entity2) || { _id: m.entity2, firstName: '', lastName: '', email: '', phone: '', sourceSystem: '', isGolden: false }
        : m.entity2
  }));
}

async function match(req, res) {
  const matchesRaw = await findPotentialMatches(Entity);
  const matches = await normalizeMatchesIfNeeded(matchesRaw);
  return api.sendSuccess(res, { matchCount: matches.length, matches });
}

async function merge(req, res) {
  const { entity1Id, entity2Id } = req.body || {};

  if (!entity1Id || !entity2Id) {
    return api.sendBadRequest(res, 'entity1Id and entity2Id are required');
  }

  const result = await createGoldenRecordForPair(entity1Id, entity2Id);

  if (!result.success) {
    if (result.conflict) return res.status(409).json(result);
    return res.status(404).json(result);
  }

  return api.sendSuccess(res, result);
}

module.exports = {
  match: asyncHandler(match),
  merge: asyncHandler(merge)
};

