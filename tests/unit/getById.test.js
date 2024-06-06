const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const getFragmentById = require('../../src/routes/api/getById');
const { Fragment } = require('../../src/model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../src/response');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = 'test-owner-id';
  next();
});

app.get('/v1/fragments/:id', getFragmentById);

// Helper function to create a fragment in the database
async function createTestFragment() {
  const fragment = new Fragment({
    ownerId: 'test-owner-id',
    type: 'text/plain; charset=utf-8',
    size: 20,
  });
  await fragment.save();
  await fragment.setData(Buffer.from('This is a test fragment'));
  return fragment;
}

describe('GET /v1/fragments/:id', () => {
  let testFragment;

  beforeAll(async () => {
    // Create a test fragment before running the tests
    testFragment = await createTestFragment();
  });

  it('should return the fragment data for a valid fragment ID', async () => {
    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe(testFragment.type);
    expect(response.text).toBe('This is a test fragment');
  });

  it('should return 404 for a non-existent fragment ID', async () => {
    const response = await request(app)
      .get('/v1/fragments/non-existent-id')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  it('should return 500 for an internal server error', async () => {
    jest.spyOn(Fragment, 'byId').mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const response = await request(app)
      .get(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(createErrorResponse(500, 'Internal Server Error'));

    Fragment.byId.mockRestore();
  });
});
