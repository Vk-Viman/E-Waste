const Bin = require('./model.bin');
const Collection = require('./model');

async function recordScan({ binId, collectorId, weight, timestamp }) {
  if (!binId || !collectorId) throw new Error('binId and collectorId are required');

  // Verify bin exists
  const bin = await Bin.findOne({ binId });
  if (!bin) {
    throw { status: 404, message: 'Bin not found' };
  }

  // Create collection record
  const record = await Collection.create({ binId, collectorId, weight: weight || null, timestamp: timestamp ? new Date(timestamp) : new Date() });

  // Notify dependent modules (billing, reporting, waste tracking)
  // In a full system, this would publish to a message broker or call internal APIs.
  // For now, log and return a simple payload.
  console.log('Collection recorded:', record._id.toString(), 'notify: billing, reporting, tracking');

  return { ok: true, id: record._id, binId: record.binId };
}

module.exports = { recordScan };
