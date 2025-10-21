const Account = require('./model');
const { httpError } = require('../../utils/httpError');

async function getMyAccount(req, res) {
  const userId = req.user?.id;
  if (!userId) throw httpError(401, 'Unauthorized');
  const acct = await Account.findOne({ userId }) || await Account.create({ userId });
  return res.json(acct);
}

async function schedulePickup(req, res) {
  const userId = req.user?.id;
  if (!userId) throw httpError(401, 'Unauthorized');
  const { date, notes } = req.body || {};
  const acct = await Account.findOneAndUpdate(
    { userId },
    { $push: { pickups: { date, notes } } },
    { new: true, upsert: true }
  );
  return res.json(acct);
}

module.exports = { getMyAccount, schedulePickup };
