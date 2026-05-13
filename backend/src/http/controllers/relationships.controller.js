const Entity = require('../../models/Entity');
const Relationship = require('../../models/Relationship');
const { findPotentialMatches } = require('../../services/matchingService');
const asyncHandler = require('../../middleware/asyncHandler');
const api = require('../../utils/apiResponse');

async function list(req, res) {
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
  return api.sendSuccess(res, { relationships });
}

async function graph(req, res) {
  const entities = await Entity.find({}).lean().exec();
  const entityMap = new Map(entities.map((e) => [e._id.toString(), e]));

  // Persisted relationships
  const relationships = await Relationship.find({}).lean().exec();
  const persistedEdges = relationships.map((rel) => ({
    id: rel._id.toString(),
    source: rel.fromId.toString(),
    target: rel.toId.toString(),
    type: rel.type,
    confidence: 100,
    reason: `Persisted ${rel.type}`,
    style: 'solid'
  }));

  // Inferred edges from potential matches
  const matches = await findPotentialMatches(Entity);
  const potentialEdges = matches
    .filter(
      (m) =>
        !entityMap.get(m.entity1._id)?.goldenId && !entityMap.get(m.entity2._id)?.goldenId
    )
    .map((m) => ({
      id: `${m.entity1._id}-${m.entity2._id}`,
      source: m.entity1._id,
      target: m.entity2._id,
      type: 'potential',
      confidence: m.score,
      reason: m.reason,
      style: m.score > 80 ? 'solid' : 'dashed'
    }));

  // Edges for merged entities (same goldenId)
  const goldenGroups = {};
  entities.forEach((e) => {
    if (e.goldenId) {
      const gid = e.goldenId.toString();
      if (!goldenGroups[gid]) goldenGroups[gid] = [];
      goldenGroups[gid].push(e._id.toString());
    }
  });

  const mergedEdges = [];
  Object.values(goldenGroups).forEach((group) => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        mergedEdges.push({
          id: `${group[i]}-${group[j]}`,
          source: group[i],
          target: group[j],
          type: 'merged',
          confidence: 100,
          reason: 'Merged into golden record',
          style: 'solid'
        });
      }
    }
  });

  const edges = [...persistedEdges, ...potentialEdges, ...mergedEdges];

  // Nodes
  const nodes = entities.map((e) => ({
    id: e._id.toString(),
    label: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.email || 'Unknown',
    isGolden: e.isGolden,
    sourceSystem: e.sourceSystem
  }));

  return api.sendSuccess(res, { nodes, edges });
}

module.exports = {
  list: asyncHandler(list),
  graph: asyncHandler(graph)
};

