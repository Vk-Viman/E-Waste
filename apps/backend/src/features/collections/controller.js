const CollectionsService = require('./service');
const Bin = require('./model.bin');

async function scan(req, res) {
  try {
    const payload = req.body || {};
    const result = await CollectionsService.recordScan(payload);
    return res.json(result);
  } catch (err) {
    console.error('collections.scan error', err);
    if (err && err.status) return res.status(err.status).json({ message: err.message });
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Development helper: create or update a test bin
async function seedBin(req, res) {
  try {
    const id = req.params.id || 'BIN-TEST-001';
    await Bin.ensureBin(id, { location: 'Test Area', category: 'general' });
    return res.json({ ok: true, binId: id });
  } catch (err) {
    console.error('seedBin error', err);
    return res.status(500).json({ message: 'Failed to seed bin' });
  }
}

module.exports = { scan, seedBin };
