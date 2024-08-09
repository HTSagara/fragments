const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const getFragmentById = require('../../src/routes/api/getById');
const { Fragment } = require('../../src/model/fragment');
const { createErrorResponse } = require('../../src/response');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = 'test-owner-id';
  next();
});

app.get('/v1/fragments/:id', getFragmentById);

// Helper function to create a fragment in the database
async function createTestFragment(
  type = 'text/plain; charset=utf-8',
  content = 'This is a test fragment'
) {
  const fragment = new Fragment({
    ownerId: 'test-owner-id',
    type: type,
    size: Buffer.byteLength(content),
  });
  await fragment.save();
  await fragment.setData(Buffer.from(content));
  return fragment;
}

describe('GET /v1/fragments/:id', () => {
  let testFragment;

  it('should return raw fragment data for a valid fragment ID without extension', async () => {
    testFragment = await createTestFragment();
    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe(testFragment.type);
    expect(response.text).toBe('This is a test fragment');
  });

  it('should return the .md fragment data converted to html', async () => {
    testFragment = await createTestFragment('text/markdown', 'This is a test fragment');

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.md`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(response.text.trim()).toBe('<p>This is a test fragment</p>');
  });

  it('should return plain text fragment data for a .txt extension', async () => {
    testFragment = await createTestFragment('text/plain', 'This is plain text');

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.txt`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toBe('This is plain text');
  });

  it('should return 415 for unsupported conversion type for plain text', async () => {
    testFragment = await createTestFragment('text/plain; charset=utf-8', 'This is plain text');

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.png`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(415);
    expect(response.body).toEqual(createErrorResponse(415, 'Unknown or unsupported type'));
  });

  it('should return the fragment as an image when a valid image extension is provided', async () => {
    const imageBuffer = Buffer.from([
      /* ...binary data... */
    ]);
    testFragment = await createTestFragment('image/png', imageBuffer);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.png`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(response.body).toEqual(imageBuffer);
  });

  it('should return 415 for unsupported conversion type for image', async () => {
    const imageBuffer = Buffer.from([
      /* ...binary data... */
    ]);
    testFragment = await createTestFragment('image/png', imageBuffer);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.txt`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(415);
    expect(response.body).toEqual(
      createErrorResponse(415, 'Unsupported conversion type for image')
    );
  });

  it('should return 404 for a non-existent fragment ID', async () => {
    const response = await request(app)
      .get('/v1/fragments/non-existent-id')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  it('should return JSON fragment data for a .json extension', async () => {
    const jsonContent = JSON.stringify({ key: 'value' });
    testFragment = await createTestFragment('application/json', jsonContent);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.json`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(response.text).toBe(jsonContent);
  });

  it('should return 415 for unsupported conversion type for JSON', async () => {
    const jsonContent = JSON.stringify({ key: 'value' });
    testFragment = await createTestFragment('application/json', jsonContent);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.yaml`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(415);
    expect(response.body).toEqual(createErrorResponse(415, 'Unsupported conversion type for JSON'));
  });

  it('should return YAML fragment data for a .yaml extension', async () => {
    const yamlContent = 'key: value\n';
    testFragment = await createTestFragment('application/yaml', yamlContent);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.yaml`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/yaml');
    expect(response.text).toBe(yamlContent);
  });

  it('should return 415 for unsupported conversion type for YAML', async () => {
    const yamlContent = 'key: value\n';
    testFragment = await createTestFragment('application/yaml', yamlContent);

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.json`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(415);
    expect(response.body).toEqual(createErrorResponse(415, 'Unsupported conversion type for YAML'));
  });
});
