const express = require('express');
const router = express.Router();
const Entity = require('../models/Entity');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Readable } = require('stream');
const { createGoldenRecords } = require('../services/goldenRecordService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.INGEST_MAX_FILE_MB, 10) || 5) * 1024 * 1024 }
});

const VALID_MODES = new Set(['replace', 'append']);

const normalizeMode = (mode) => {
  const value = (mode || 'replace').toLowerCase();
  return VALID_MODES.has(value) ? value : null;
};

const rowToEntity = (row) => ({
  sourceId: row.source_id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email || '',
  phone: row.phone || '',
  address: row.address || '',
  sourceSystem: row.source_system || 'CSV_IMPORT',
  rawData: row,
  isGolden: false
});

const parseCsvFromReadable = (readableStream) => new Promise((resolve, reject) => {
  const rows = [];
  readableStream
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', () => resolve(rows))
    .on('error', reject);
});

const writeEntities = async (entities, mode) => {
  if (mode === 'replace') {
    await Entity.deleteMany({});
    await Entity.insertMany(entities);
    return entities.length;
  }

  if (entities.length === 0) return 0;

  const operations = entities.map((entity) => {
    if (entity.sourceId && entity.sourceSystem) {
      return {
        updateOne: {
          filter: { sourceId: entity.sourceId, sourceSystem: entity.sourceSystem },
          update: { $set: entity },
          upsert: true
        }
      };
    }

    return { insertOne: { document: entity } };
  });

  const result = await Entity.bulkWrite(operations, { ordered: false });
  return (result.upsertedCount || 0) + (result.insertedCount || 0) + (result.modifiedCount || 0);
};

const runIngestion = async ({ rows, mode, io, source }) => {
  const entities = rows.map(rowToEntity);
  const writtenCount = await writeEntities(entities, mode);
  // Removed automatic golden record creation - now manual via /matches

  if (io) {
    io.emit('ingest-complete', {
      message: `Ingested ${rows.length} rows via ${source} (${mode})`,
      rowsReceived: rows.length,
      recordsWritten: writtenCount,
      goldenCreated: 0, // No auto-creation
      mode,
      source
    });
  }

  return {
    success: true,
    message: `✅ Ingested ${rows.length} rows via ${source} (${mode})`,
    mode,
    source,
    rowsReceived: rows.length,
    recordsWritten: writtenCount,
    goldenCreated: 0
  };
};

const resolveCsvPath = () => {
  const envPath = process.env.INGEST_CSV_PATH;

  // Candidate paths cover both local monorepo runs and backend-only production deploys.
  const candidates = [
    envPath ? path.resolve(process.cwd(), envPath) : null,
    path.resolve(__dirname, '../../../data/sample-customers.csv'), // local: backend/src/routes -> project-root/data
    path.resolve(process.cwd(), 'data/sample-customers.csv'), // cwd is project root
    path.resolve(process.cwd(), 'sample-customers.csv'), // backend-only deploy with file copied at app root
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  return { found, candidates };
};

router.post('/ingest', async (req, res) => {
  const mode = normalizeMode(req.query.mode || req.body?.mode);
  if (!mode) {
    return res.status(400).json({ success: false, error: 'Invalid mode. Use replace or append.' });
  }

  const { found: csvPath, candidates } = resolveCsvPath();

  // Check if file exists first (helpful error message)
  if (!csvPath) {
    return res.status(404).json({
      success: false,
      error: 'CSV file not found. Set INGEST_CSV_PATH or ensure sample-customers.csv is deployed with your backend.',
      searchedPaths: candidates
    });
  }

  try {
    const rows = await parseCsvFromReadable(fs.createReadStream(csvPath));
    const result = await runIngestion({
      rows,
      mode,
      io: req.app.get('io'),
      source: 'local-file'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ingest/upload', upload.single('file'), async (req, res) => {
  const mode = normalizeMode(req.query.mode || req.body?.mode);
  if (!mode) {
    return res.status(400).json({ success: false, error: 'Invalid mode. Use replace or append.' });
  }

  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, error: 'CSV file is required in form-data key "file".' });
  }

  try {
    const rows = await parseCsvFromReadable(Readable.from(req.file.buffer));
    const result = await runIngestion({
      rows,
      mode,
      io: req.app.get('io'),
      source: 'upload'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ingest/url', async (req, res) => {
  const mode = normalizeMode(req.query.mode || req.body?.mode);
  const csvUrl = req.body?.csvUrl;

  if (!mode) {
    return res.status(400).json({ success: false, error: 'Invalid mode. Use replace or append.' });
  }

  if (!csvUrl) {
    return res.status(400).json({ success: false, error: 'csvUrl is required in request body.' });
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok || !response.body) {
      return res.status(400).json({ success: false, error: `Unable to fetch CSV URL. Status: ${response.status}` });
    }

    const rows = await parseCsvFromReadable(Readable.fromWeb(response.body));
    const result = await runIngestion({
      rows,
      mode,
      io: req.app.get('io'),
      source: 'url'
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;