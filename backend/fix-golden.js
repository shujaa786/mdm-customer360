require('dotenv').config();
const connectDB = require('./src/configs/db');
const Entity = require('./src/models/Entity');

async function fixGoldenRecords() {
  await connectDB();
  const result = await Entity.updateMany(
    { sourceSystem: 'GOLDEN_RECORD', sourceId: null },
    { $set: { sourceId: '$_id' } }
  );
  console.log('Updated:', result.modifiedCount);
  process.exit(0);
}

fixGoldenRecords().catch(console.error);