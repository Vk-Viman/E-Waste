const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../src/features/auth/service');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

function mockRes() {
  return {};
}

function mockNext() {
  const fn = jest.fn();
  return fn;
}

describe('Middleware', () => {
  test('protect passes with valid cookie token', () => {
    const token = jwt.sign({ id: '123', role: 'USER' }, JWT_SECRET);
    const req = { cookies: { ecocollect_token: token } };
    const res = mockRes();
    const next = mockNext();
    expect(() => protect(req, res, next)).not.toThrow();
    expect(typeof req.user).toBe('object');
  });

  test('protect rejects missing token', () => {
    const req = { cookies: {} };
    const res = mockRes();
    const next = mockNext();
    expect(() => protect(req, res, next)).toThrow(/Unauthorized/);
  });

  test('adminOnly allows ADMIN and rejects USER', () => {
    const res = mockRes();
    const next = mockNext();
    const reqAdmin = { user: { role: 'ADMIN' } };
    expect(() => adminOnly(reqAdmin, res, next)).not.toThrow();
    const reqUser = { user: { role: 'USER' } };
    expect(() => adminOnly(reqUser, res, next)).toThrow(/Forbidden/);
  });
});
