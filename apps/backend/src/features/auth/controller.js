const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./model');
const { loginUser } = require('./service');
const { httpError } = require('../../utils/httpError');
const nodemailer = require('nodemailer');

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw httpError(400, 'email and password are required');
  }
  const result = await loginUser(email, password);
  // Set HttpOnly cookie instead of returning token in body
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('ecocollect_token', result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 24 * 60 * 60 * 1000,
  });
  return res.json({ user: result.user });
}

// Creates or updates an admin account; safe to call multiple times.
async function seedAdmin(req, res) {
  const email = process.env.ADMIN_EMAIL || 'admin@ecocollect.local';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Admin';
  // If user exists, update password; else create new (pre-save will hash)
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, password, role: 'ADMIN' });
  } else {
    user.password = password;
    user.role = 'ADMIN';
  }
  await user.save();
  return res.json({ ok: true, email: user.email, role: user.role, name });
}

module.exports = { login, seedAdmin };
// Registration: creates a USER account
async function register(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw httpError(400, 'email and password are required');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    throw httpError(409, 'email already in use');
  }
  const user = new User({ email, password, role: 'USER' });
  await user.save();
  return res.status(201).json({ ok: true });
}

module.exports.register = register;

// Return session info for the authenticated user
async function session(req, res) {
  const id = req.user?.id;
  const role = req.user?.role;
  if (!id) {
    throw httpError(401, 'Unauthorized');
  }
  const user = await User.findById(id).select({ email: 1, role: 1 });
  if (!user) {
    throw httpError(401, 'Unauthorized');
  }
  return res.json({ id: user._id, email: user.email, role: user.role });
}

module.exports.session = session;

// Logout: clear the HttpOnly auth cookie
async function logout(req, res) {
  const secure = process.env.NODE_ENV === 'production';
  res.clearCookie('ecocollect_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure,
  });
  return res.json({ ok: true });
}

module.exports.logout = logout;

// Forgot Password: generate token, save hashed token + expiry, email link
async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) throw httpError(400, 'email is required');
  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal whether email exists
    return res.json({ ok: true });
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  const RESET_BASE = process.env.RESET_PASSWORD_BASE_URL || 'http://localhost:3001/reset-password';
  const resetUrl = `${RESET_BASE}/${resetToken}`;

  const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  if (hasSmtp) {
    // Create a transporter using provided SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_FROM || 'no-reply@ecocollect.local',
      to: email,
      subject: 'EcoCollect Password Reset',
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl} \nIf you did not request this, please ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you did not request this, please ignore this email.</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (e) {
      // On email failure, clear tokens to avoid dangling reset
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw httpError(500, 'Failed to send reset email');
    }
  } else {
    // Dev mode: no SMTP available, just log the link to console
    console.log('[DEV] Password reset link for', email, '=>', resetUrl);
  }

  return res.json({ ok: true });
}

module.exports.forgotPassword = forgotPassword;

// Reset Password: verify hashed token and expiry, update password
async function resetPassword(req, res) {
  const token = req.params.token;
  const { password } = req.body || {};
  if (!token) throw httpError(400, 'token is required');
  if (!password || password.length < 6) throw httpError(400, 'password must be at least 6 characters');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });
  if (!user) throw httpError(400, 'Invalid or expired token');

  user.password = password; // pre-save hook will hash
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res.json({ ok: true });
}

module.exports.resetPassword = resetPassword;
