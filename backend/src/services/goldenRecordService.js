const Entity = require('../models/Entity');
const { findPotentialMatches } = require('./matchingService');
const Relationship = require('../models/Relationship');

async function createGoldenRecordForPair(entity1Id, entity2Id) {
  const lockId = `${entity1Id}:${entity2Id}:${Date.now()}`;
  const lockResult = await Entity.updateMany(
    {
      _id: { $in: [entity1Id, entity2Id] },
      mergeLock: null
    },
    { $set: { mergeLock: lockId } }
  );

  if (lockResult.modifiedCount !== 2) {
    await Entity.updateMany({ mergeLock: lockId }, { $set: { mergeLock: null } });
    return { success: false, conflict: true, error: 'Merge in progress for one of these records' };
  }

  try {
  const entity1 = await Entity.findById(entity1Id);
  const entity2 = await Entity.findById(entity2Id);

  if (!entity1 || !entity2) {
    return { success: false, error: 'One or both entities not found' };
  }

  const existingGoldenId = entity1.goldenId || entity2.goldenId;
  if (existingGoldenId) {
    return {
      success: true,
      message: 'Entities already linked to golden record',
      goldenId: existingGoldenId
    };
  }

  const goldenData = {
    firstName: entity1.firstName || entity2.firstName,
    lastName: entity1.lastName || entity2.lastName,
    email: entity1.email || entity2.email,
    phone: entity1.phone || entity2.phone,
    address: entity1.address || entity2.address,
    sourceSystem: 'GOLDEN_RECORD',
    rawData: { mergedFrom: [entity1._id, entity2._id] },
    mergedFrom: [entity1._id, entity2._id],
    isGolden: true,
    goldenId: null
  };

  const goldenRecord = await Entity.create(goldenData);

  goldenRecord.sourceId = goldenRecord._id.toString();
  await goldenRecord.save();

  entity1.goldenId = goldenRecord._id;
  entity2.goldenId = goldenRecord._id;
  await entity1.save();
  await entity2.save();

  // Create relationship between merged entities
  // await Relationship.create({
  //   fromId: entity1._id,
  //   toId: entity2._id,
  //   type: 'MATCH'
  // });

  return {
    success: true,
    message: 'Golden record created',
    goldenRecord
  };
  } finally {
    await Entity.updateMany({ _id: { $in: [entity1Id, entity2Id] }, mergeLock: lockId }, { $set: { mergeLock: null } });
  }
}

async function createGoldenRecords() {
  const matches = await findPotentialMatches(Entity);
  
  if (matches.length === 0) {
    return { success: true, message: 'No matches found to create golden records' };
  }

  let createdCount = 0;

  for (const match of matches) {
    const result = await createGoldenRecordForPair(match.entity1._id, match.entity2._id);
    if (result.success && result.goldenRecord) createdCount++;
  }

  return {
    success: true,
    message: `✅ Created ${createdCount} golden records with survivorship rules`,
    goldenCount: createdCount
  };
}

module.exports = { createGoldenRecords, createGoldenRecordForPair };