const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../src/app');
// const { Fragment } = require('../../src/model/fragment');
// const createFragment = require('../../src/routes/api/post');
const { createErrorResponse } = require('../../src/response');

// Set up a temporary htpasswd file for testing
const htpasswdFilePath = path.join(__dirname, 'htpasswd');
fs.writeFileSync(htpasswdFilePath, 'testuser:$apr1$X8woei2.$0yX9xdI/9FONmGwJW2k8O.\n');
process.env.HTPASSWD_FILE = htpasswdFilePath;

describe('POST /v1/fragments', () => {
  afterAll(() => {
    // Clean up the temporary htpasswd file after tests
    fs.unlinkSync(htpasswdFilePath);
  });

  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment');

    expect(res.status).toBe(201);
    expect(res.headers.location).toBeDefined();
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toMatchObject({
      type: 'text/plain',
      size: 23,
      ownerId: expect.any(String),
    });
  });

  test('unauthenticated users cannot create a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment');

    expect(res.status).toBe(401);
  });

  test('response includes expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment');

    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment).toHaveProperty('created');
    expect(res.body.fragment).toHaveProperty('type', 'text/plain');
    expect(res.body.fragment).toHaveProperty('size', 23);
    expect(res.body.fragment).toHaveProperty('ownerId', res.body.fragment.ownerId);
  });

  test('unsupported content type errors as expected', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/xml')
      .send('<test>This is a test fragment</test>');

    expect(res.status).toBe(415);
    expect(res.body).toEqual(createErrorResponse(415, 'Unsupported content type'));
  });

  test('should create a fragment successfully', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('<test>This is a test fragment</test>');

    expect(res.status).toBe(201);
  });
});
