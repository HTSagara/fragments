const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const getFragmentById = require('../../src/routes/api/getById');
const { Fragment } = require('../../src/model/fragment');
const { createErrorResponse } = require('../../src/response');
const sharp = require('sharp');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = 'test-owner-id';
  next();
});

app.get('/v1/fragments/:id', getFragmentById);

async function createTestFragment(
  type = 'text/plain; charset=utf-8',
  data = 'This is a test fragment'
) {
  const fragment = new Fragment({
    ownerId: 'test-owner-id',
    type: type,
    size: data.length,
  });
  await fragment.save();
  await fragment.setData(Buffer.from(data));
  return fragment;
}

describe('GET /v1/fragments/:id', () => {
  it('should return the fragment data for a valid fragment ID', async () => {
    const testFragment = await createTestFragment();
    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe(testFragment.type);
    expect(response.text).toBe('This is a test fragment');
  });

  it('should return the .md fragment data converted to html', async () => {
    const testFragment = await createTestFragment('text/markdown', '# This is a **test** fragment');

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.md`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(response.text).toBe('<h1>This is a <strong>test</strong> fragment</h1>\n');
  });

  it('should return an image fragment converted to png', async () => {
    const imageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .png()
      .toBuffer();

    const testFragment = await createTestFragment('image/jpeg', imageBuffer);
    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.png`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(response.body).toEqual(expect.any(Buffer));
  });

  it('should return 404 for a non-existent fragment ID', async () => {
    const response = await request(app)
      .get('/v1/fragments/non-existent-id')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  it('should return 415 for unsupported conversion', async () => {
    const testFragment = await createTestFragment('text/plain');
    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.unsupported`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(415);
    expect(response.body).toEqual(createErrorResponse(415, 'Unknown or unsupported type'));
  });
});
