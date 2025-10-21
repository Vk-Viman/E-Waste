const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, index: true },
    collectorId: { type: String, required: true, index: true },
    weight: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', CollectionSchema);
