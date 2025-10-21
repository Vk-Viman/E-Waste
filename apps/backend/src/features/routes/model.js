const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema(
  {
    name: String,
    stops: [{ type: String }],
    status: { type: String, enum: ['planned', 'active', 'completed'], default: 'planned' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoutePlan', RouteSchema);
