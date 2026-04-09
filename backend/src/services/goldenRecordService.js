const Entity = require('../models/Entity');
const { findPotentialMatches } = require('./matchingService');

async function createGoldenRecords() {
  const matches = await findPotentialMatches(Entity);
  
  if (matches.length === 0) {
    return { success: true, message: 'No matches found to create golden records' };
  }

  let createdCount = 0;

  for (const match of matches) {
    const entity1 = await Entity.findById(match.entity1);
    const entity2 = await Entity.findById(match.entity2);

    if (!entity1 || !entity2) continue;

    // Survivorship Rule: Merge fields, prefer non-empty values
    const goldenData = {
      firstName: entity1.firstName || entity2.firstName,
      lastName: entity1.lastName || entity2.lastName,
      email: entity1.email || entity2.email,
      phone: entity1.phone || entity2.phone,
      address: entity1.address || entity2.address,
      sourceSystem: 'GOLDEN_RECORD',
      rawData: { mergedFrom: [entity1._id, entity2._id] },
      isGolden: true,
      goldenId: null
    };

    const goldenRecord = await Entity.create(goldenData);
    createdCount++;

    // Link original entities to this golden record
    entity1.goldenId = goldenRecord._id;
    entity2.goldenId = goldenRecord._id;
    await entity1.save();
    await entity2.save();
  }

  return {
    success: true,
    message: `✅ Created ${createdCount} golden records with survivorship rules`,
    goldenCount: createdCount
  };
}

module.exports = { createGoldenRecords };