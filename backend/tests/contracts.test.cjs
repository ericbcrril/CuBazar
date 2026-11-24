const test = require('node:test');
const assert = require('node:assert/strict');
const {
  registerSchema,
} = require('../dist/modules/auth/auth.schemas');
const {
  createProductSchema,
} = require('../dist/modules/products/products.schemas');
const {
  confirmTransactionSchema,
  createReviewSchema,
} = require('../dist/modules/transactions/transactions.schemas');
const {
  Conversation,
  Message,
  Product,
  ProductComment,
  Transaction,
} = require('../dist/models');

test('register accepts only institutional student emails', () => {
  const valid = registerSchema.safeParse({
    body: {
      email: 'student@alumnos.udg.mx',
      password: 'secure-password',
      fullName: 'Estudiante UdG',
    },
  });
  const invalid = registerSchema.safeParse({
    body: {
      email: 'student@example.com',
      password: 'secure-password',
      fullName: 'Estudiante UdG',
    },
  });
  assert.equal(valid.success, true);
  assert.equal(invalid.success, false);
});

test('product creation accepts multipart price and applies catalog defaults', () => {
  const parsed = createProductSchema.safeParse({
    body: {
      title: 'Libro de cálculo',
      description: 'Libro en buen estado para el semestre',
      price: '125.50',
      condition: 'USADO_BUEN_ESTADO',
    },
  });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.body.price, 125.5);
  assert.equal(parsed.data.body.type, 'VENTA');
  assert.equal(parsed.data.body.status, 'PUBLISHED');
});

test('bilateral confirmation and review schemas enforce identifiers and rating range', () => {
  assert.equal(
    confirmTransactionSchema.safeParse({
      body: { conversationId: '507f1f77bcf86cd799439011', confirmed: true },
    }).success,
    true,
  );
  assert.equal(
    createReviewSchema.safeParse({
      params: { id: '507f1f77bcf86cd799439011' },
      body: { rating: 6 },
    }).success,
    false,
  );
});

test('Mongo models register the references used by populated API responses', () => {
  assert.ok(Product.schema.virtuals.seller);
  assert.ok(Product.schema.virtuals.images);
  assert.ok(ProductComment.schema.virtuals.user);
  assert.ok(Conversation.schema.virtuals.transaction);
  assert.ok(Message.schema.virtuals.sender);
  assert.ok(Transaction.schema.virtuals.product);
});
