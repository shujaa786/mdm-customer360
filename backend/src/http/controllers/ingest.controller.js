const Entity = require('../../models/Entity');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Readable } = require('stream');

const asyncHandler = require('../../middleware/asyncHandler');
const api = require('../../utils/apiResponse');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.INGEST_MAX_FILE_MB, 10) || 5) * 1024 * 1024 }
});

const VALID_MODES = new Set(['replace', 'append']);

function normalizeMode(mode) {
  const value = (mode || 'replace').toLowerCase();
  return VALID_MODES.has(value) ? value : null;
}

function rowToEntity(row) {
  return {
    sourceId: row.source_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email || '',
    phone: row.phone || '',
    address: row.address || '',
    sourceSystem: row.source_system || 'CSV_IMPORT',
    rawData: row,
    isGolden: false
  };
}

function parseCsvFromReadable(readableStream) {
  return new Promise((resolve, reject) => {
    const rows = [];
    readableStream
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function writeEntities(entities, mode) {
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
}

function resolveCsvPath() {
  const envPath = process.env.INGEST_CSV_PATH;

  const candidates = [
    envPath ? path.resolve(process.cwd(), envPath) : null,
    path.resolve(__dirname, '../../../data/sample-customers.csv'),
    path.resolve(process.cwd(), 'data/sample-customers.csv'),
    path.resolve(process.cwd(), 'sample-customers.csv')
  ].filter(Boolean);

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  return { found, candidates };
}

async function runIngestion({ rows, mode, io, source }) {
  const entities = rows.map(rowToEntity);
  const writtenCount = await writeEntities(entities, mode);

  if (io) {
    io.emit('ingest-complete', {
      message: `Ingested ${rows.length} rows via ${source} (${mode})`,
      rowsReceived: rows.length,
      recordsWritten: writtenCount,
      goldenCreated: 0,
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
}

async function ingest(req, res) {
  const mode = normalizeMode(req.query.mode || req.body?.mode);
  if (!mode) return api.sendBadRequest(res, 'Invalid mode. Use replace or append.');

  const { found: csvPath, candidates } = resolveCsvPath();
  if (!csvPath) {
    return res.status(404).json({
      success: false,
      error: 'CSV file not found. Set INGEST_CSV_PATH or ensure sample-customers.csv is deployed with your backend.',
      searchedPaths: candidates
    });
  }

  const rows = await parseCsvFromReadable(fs.createReadStream(csvPath));

  const result = await runIngestion({
    rows,
    mode,
    io: req.app.get('io'),
    source: 'local-file'
  });

  return api.sendSuccess(res, result);
}

async function ingestUpload(req, res) {
  const mode = normalizeMode(req.query.mode || req.body?.mode);
  if (!mode) return api.sendBadRequest(res, 'Invalid mode. Use replace or append.');

  if (!req.file?.buffer) return api.sendBadRequest(res, 'CSV file is required in form-data key "file".');

  const rows = await parseCsvFromReadable(Readable.from(req.file.buffer));

  const result = await runIngestion({
    rows,
    mode,
    io: req.app.get('io'),
    source: 'upload'
  });

  return api.sendSuccess(res, result);
}

async function ingestFromUrl(req, res) {
  const mode = normalizeMode(req.query.mode || req.body?.mode);
  const csvUrl = req.body?.csvUrl;

  if (!mode) return api.sendBadRequest(res, 'Invalid mode. Use replace or append.');
  if (!csvUrl) return api.sendBadRequest(res, 'csvUrl is required in request body.');

  const response = await fetch(csvUrl);
  if (!response.ok || !response.body) {
    return api.sendBadRequest(res, `Unable to fetch CSV URL. Status: ${response.status}`);
  }

  const rows = await parseCsvFromReadable(Readable.fromWeb(response.body));

  const result = await runIngestion({
    rows,
    mode,
    io: req.app.get('io'),
    source: 'url'
  });

  return api.sendSuccess(res, result);
}

module.exports = {
  ingest: asyncHandler(ingest),
  ingestUpload: [upload.single('file'), asyncHandler(ingestUpload)],
  ingestFromUrl: asyncHandler(ingestFromUrl)
};

