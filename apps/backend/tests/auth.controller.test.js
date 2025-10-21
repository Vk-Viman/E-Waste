const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const asyncHandler = require('../src/utils/asyncHandler');
const { register } = require('../src/features/auth/controller');
const errorHandler = require('../src/middleware/errorHandler');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.post('/auth/register', asyncHandler(register));
  app.use(errorHandler);
  return app;
}

describe('Auth Controller - register', () => {
  test('successful user registration', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'new@user.com', password: 'secret123' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
  });

  test('failed registration if email already in use', async () => {
    const app = buildApp();
    await request(app).post('/auth/register').send({ email: 'dup@user.com', password: 'x' });
    const res = await request(app).post('/auth/register').send({ email: 'dup@user.com', password: 'y' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.message).toMatch(/already in use/i);
  });
});
