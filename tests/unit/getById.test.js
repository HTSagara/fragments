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
async function createTestFragment(type = 'text/plain; charset=utf-8') {
  const fragment = new Fragment({
    ownerId: 'test-owner-id',
    type: type,
    size: 20,
  });
  await fragment.save();
  await fragment.setData(Buffer.from('This is a test fragment'));
  return fragment;
}

describe('GET /v1/fragments/:id', () => {
  let testFragment;

  // beforeAll(async () => {
  //   // Create a test fragment before running the tests
  //   testFragment = await createTestFragment();
  // });

  it('should return the fragment data for a valid fragment ID', async () => {
    testFragment = await createTestFragment();
    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe(testFragment.type);
    expect(response.text).toBe('This is a test fragment');
  });

  it('should return the .md fragment data converted to html', async () => {
    testFragment = await createTestFragment('text/markdown');

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}.md`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(response.text).toBe('This is a test fragment');
  });

  it('should return 404 for a non-existent fragment ID', async () => {
    testFragment = await createTestFragment();
    const response = await request(app)
      .get('/v1/fragments/non-existent-id')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });
});
