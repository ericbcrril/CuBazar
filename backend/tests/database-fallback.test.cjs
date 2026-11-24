const test = require('node:test');
const assert = require('node:assert/strict');

process.env.PORT = '3000';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = '*';
process.env.MONGODB_URI = 'mongodb://primary.example.test:27017/cubazar';
process.env.MONGODB_DATABASE = 'cuBazar-db';
process.env.URI_NOT_SRV0 =
  'mongodb://test-user:test-password@host-0.test:27017,host-1.test:27017,host-2.test:27017/';
process.env.URI_NOT_SRV1 = '?tls=true&replicaSet=test-replica&authSource=admin';
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '8h';
process.env.GOOGLE_CLIENT_ID = 'test.apps.googleusercontent.com';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';

const mongoose = require('mongoose');
const { connectToDatabase } = require('../dist/config/database');

test('uses the primary Mongo URI when it connects', async (t) => {
  const originalConnect = mongoose.connect;
  const attemptedUris = [];
  mongoose.connect = async (uri) => {
    attemptedUris.push(uri);
    return mongoose;
  };
  t.after(() => {
    mongoose.connect = originalConnect;
  });

  await connectToDatabase();
  assert.deepEqual(attemptedUris, [process.env.MONGODB_URI]);
});

test('retries with the composed notSRV URI after the primary connection fails', async (t) => {
  const originalConnect = mongoose.connect;
  const attemptedUris = [];
  mongoose.connect = async (uri) => {
    attemptedUris.push(uri);
    if (attemptedUris.length === 1) {
      const error = new Error('primary unavailable');
      error.code = 'ECONNREFUSED';
      throw error;
    }
    return mongoose;
  };
  t.after(() => {
    mongoose.connect = originalConnect;
  });

  await connectToDatabase();
  assert.deepEqual(attemptedUris, [
    process.env.MONGODB_URI,
    'mongodb://test-user:test-password@host-0.test:27017,host-1.test:27017,host-2.test:27017/cuBazar-db?tls=true&replicaSet=test-replica&authSource=admin',
  ]);
});
