const mongoose = require('mongoose');

const BinSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, unique: true, index: true },
    location: { type: String },
    category: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    areaId: { type: String, index: true }, // For grouping bins by area
  },
  { timestamps: true }
);

const Bin = mongoose.model('Bin', BinSchema);

// Optional seed helper used during development
async function ensureBin(binId, opts = {}) {
  return Bin.findOneAndUpdate({ binId }, { binId, ...opts }, { upsert: true, new: true });
}

module.exports = Bin;
module.exports.ensureBin = ensureBin;
