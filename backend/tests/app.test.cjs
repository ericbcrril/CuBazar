const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');

process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = '*';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/cubazar-test';
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '8h';
process.env.GOOGLE_CLIENT_ID = 'test.apps.googleusercontent.com';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';

const { app } = require('../dist/app');

async function withServer(callback) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const address = server.address();
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test('health endpoint responds with the standard success envelope', async (t) => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      success: true,
      message: 'Operación realizada correctamente',
      data: { status: 'ok' },
    });
  });
});

test('registration rejects non-institutional email before database access', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'secure-password',
        fullName: 'Estudiante UdG',
      }),
    });
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });
});

test('expired bearer tokens receive a standardized 401 response', async () => {
  const token = jwt.sign(
    { id: '507f1f77bcf86cd799439011', email: 'student@alumnos.udg.mx', role: 'STUDENT' },
    process.env.JWT_SECRET,
    { expiresIn: -1 },
  );
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/users/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    assert.equal(response.status, 401);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_TOKEN');
  });
});
