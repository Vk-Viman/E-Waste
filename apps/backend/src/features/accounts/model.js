const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    address: String,
    balance: { type: Number, default: 0 },
    pickups: [{ date: Date, notes: String }],
    payments: [{ date: Date, amount: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', AccountSchema);
