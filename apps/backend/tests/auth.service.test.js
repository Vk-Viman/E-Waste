const mongoose = require('mongoose');
const User = require('../src/features/users/user.model');
const { loginUser } = require('../src/features/auth/service');

describe('Auth Service', () => {
  test('successful registration and login with correct credentials', async () => {
    const email = 'test@example.com';
    const password = 'pass1234';
    await new User({ email, password, role: 'USER' }).save();

    const result = await loginUser(email, password);
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user.email).toBe(email);
    expect(result.user.role).toBe('USER');
  });

  test('failed login with incorrect password', async () => {
    const email = 'wrongpass@example.com';
    const password = 'pass1234';
    await new User({ email, password, role: 'USER' }).save();

    await expect(loginUser(email, 'badpass')).rejects.toThrow('Invalid email or password');
  });
});
