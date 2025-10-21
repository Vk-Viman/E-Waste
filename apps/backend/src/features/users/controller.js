const User = require('./model');
const { httpError } = require('../../utils/httpError');

async function listUsers(_req, res) {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
  return res.json(users);
}

async function createUser(req, res) {
  const { name, email, password, role = 'USER' } = req.body || {};
  if (!email || !password) throw httpError(400, 'email and password are required');
  const existing = await User.findOne({ email });
  if (existing) throw httpError(409, 'email already in use');
  const user = new User({ email, role: String(role).toUpperCase() });
  if (name) user.name = name; // name is not in schema now, but keep for forward compat if added
  user.password = password; // triggers pre-save hash
  await user.save();
  return res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role });
}

module.exports = { listUsers, createUser };
