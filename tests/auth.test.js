const request = require('supertest');
const app = require('../app');

describe('Auth Endpoints', () => {
  const userData = {
    first_name: 'Osborn',
    last_name: 'Israel',
    email: 'israelosborn@yahoo.com',
    password: 'Password123',
  };

  test('should signup a new user successfully', async () => {
    const res = await request(app)
      .post('/v1/auth/signup')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', userData.email);
    expect(res.body).toHaveProperty('token');
  });

  test('should not allow duplicate signup with same email', async () => {
    await request(app).post('/v1/auth/signup').send(userData);
    const res = await request(app).post('/v1/auth/signup').send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  test('should login an existing user successfully', async () => {
    await request(app).post('/v1/auth/signup').send(userData);
    const res = await request(app).post('/v1/auth/login').send({
      email: userData.email,
      password: userData.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  test('should not login with wrong credentials', async () => {
    await request(app).post('/v1/auth/signup').send(userData);
    const res = await request(app).post('/v1/auth/login').send({
      email: userData.email,
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
