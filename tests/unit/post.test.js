const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const createFragment = require('../../src/routes/api/post');

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
      type: res.body.fragment.type,
      size: res.body.fragment.size,
      ownerId: res.body.fragment.ownerId,
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
    expect(res.body.error).toBe('Unsupported content type');
  });

  test('should create a fragment successfully', async () => {
    const req = {
      user: 'user1@email.com',
      headers: { 'content-type': 'text/plain' },
      body: Buffer.from('This is a test fragment'),
    };
    const res = {
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      location: (url) => {
        res.locationUrl = url;
        return res;
      },
      send: (data) => {
        res.sentData = data;
        return res;
      },
    };
    let fragmentSaveCalled = false;
    let fragmentSetDataCalled = false;

    Fragment.prototype.save = () => {
      fragmentSaveCalled = true;
    };
    Fragment.prototype.setData = () => {
      fragmentSetDataCalled = true;
    };

    await createFragment(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.locationUrl).not.toBe(null);
    expect(res.sentData).not.toBe(null);
    expect(fragmentSaveCalled).toBe(true);
    expect(fragmentSetDataCalled).toBe(true);
  });
});
