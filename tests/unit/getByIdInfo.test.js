const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Fragment } = require('../../src/model/fragment');
const getFragmentInfoById = require('../../src/routes/api/getByIdInfo');
const { createErrorResponse, createSuccessResponse } = require('../../src/response');

describe('GET /v1/fragments/:id/info', () => {
  let testFragment;
  let appInstance;

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

  beforeEach(async () => {
    appInstance = express();
    appInstance.use(bodyParser.json());
    appInstance.use((req, res, next) => {
      req.user = 'test-owner-id';
      next();
    });
    appInstance.get('/v1/fragments/:id/info', getFragmentInfoById);
    testFragment = await createTestFragment();
  });

  it('should return the fragment info for a valid fragment ID', async () => {
    const response = await request(appInstance)
      .get(`/v1/fragments/${testFragment.id}/info`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      createSuccessResponse({
        status: 'ok',
        fragment: testFragment,
      })
    );
  });

  it('should return 404 for a non-existent fragment ID', async () => {
    const response = await request(appInstance)
      .get('/v1/fragments/non-existent-id/info')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  it('unauthenticated requests are denied', async () => {
    const appInstanceUnauth = express();
    appInstanceUnauth.use(bodyParser.json());
    appInstanceUnauth.get('/v1/fragments/:id/info', getFragmentInfoById);

    const response = await request(appInstanceUnauth).get(`/v1/fragments/${testFragment.id}/info`);

    expect(response.status).toBe(400);
  });
});
