const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { createGoldenRecords } = require('../services/goldenRecordService');

const csvPath = path.join(__dirname, '../../../data/sample-customers.csv');

router.post('/ingest', (req, res) => {
  const results = [];

  // Check if file exists first (helpful error message)
  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({
      success: false,
      error: 'CSV file not found! Make sure data/sample-customers.csv exists at project root.'
    });
  }

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        // Clear old data so you can re-run ingest easily
        await Entity.deleteMany({});

        const entities = results.map(row => ({
          sourceId: row.source_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          address: row.address,
          sourceSystem: row.source_system,
          rawData: row,
          isGolden: false
        }));

        await Entity.insertMany(entities);
        await createGoldenRecords();
        
        const io = req.app.get('io');
        if (io) {
          io.emit('ingest-complete', {
            message: `Ingested ${results.length}+ Golden records created successfully`
          });
        }

        res.json({
          success: true,
          message: `✅ Ingested ${results.length} customer records successfully!`,
          count: results.length
        });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });
});

module.exports = router;