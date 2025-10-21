const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./model');
const { httpError } = require('../../utils/httpError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// New login service aligned with password field and uppercase roles
async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');
  const ok = await user.comparePassword(password);
  if (!ok) throw new Error('Invalid email or password');
  const payload = { id: user._id, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  return { token, user: { email: user.email, role: user.role } };
}

// Generic bearer token extractor and verifier
function protect(req, _res, next) {
  // Only read the JWT from the HttpOnly cookie in production flow
  try {
    const token = req.cookies?.ecocollect_token;
  // read token from cookie
    if (!token) throw httpError(401, 'Unauthorized');
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    // Normalize JWT errors to 401
    throw httpError(401, 'Unauthorized');
  }
}

// Role guard with case-insensitive comparison; accepts string or array
function requireRole(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  const want = roles.map(r => String(r).toUpperCase());
  return (req, _res, next) => {
    if (!req.user) throw httpError(401, 'Unauthorized');
    const actual = String(req.user.role || '').toUpperCase();
    if (want.length && !want.includes(actual)) throw httpError(403, 'Forbidden');
    return next();
  };
}

function adminOnly(req, _res, next) {
  if (!req.user) throw httpError(401, 'Unauthorized');
  if (String(req.user.role).toUpperCase() !== 'ADMIN') throw httpError(403, 'Forbidden');
  return next();
}

module.exports = { loginUser, protect, requireRole, adminOnly };
