const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Fragment } = require('../../src/model/fragment');
const updateById = require('../../src/routes/api/updateById');
const { createErrorResponse } = require('../../src/response');

const app = express();
app.use(bodyParser.raw({ type: '*/*' }));

app.use((req, res, next) => {
  req.user = 'test-owner-id';
  next();
});

app.put('/v1/fragments/:id', updateById);

// Helper function to create a fragment in the database
async function createTestFragment(type = 'text/plain') {
  const fragment = new Fragment({
    ownerId: 'test-owner-id',
    type: type,
    size: 20,
  });
  await fragment.save();
  await fragment.setData(Buffer.from('Original content'));
  return fragment;
}

describe('PUT /v1/fragments/:id', () => {
  let testFragment;

  beforeEach(async () => {
    // Create a test fragment before running the tests
    testFragment = await createTestFragment();
  });

  it('should update the fragment data for a valid fragment ID', async () => {
    const newContent = 'This is updated data';
    const response = await request(app)
      .put(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token')
      .set('Content-Type', 'text/plain')
      .send(newContent);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragment.id).toBe(testFragment.id);
    expect(response.body.fragment.size).toBe(newContent.length);

    const updatedFragment = await Fragment.byId('test-owner-id', testFragment.id);
    const updatedData = await updatedFragment.getData();
    expect(updatedData.toString()).toBe(newContent);
  });

  it('should return 404 if the fragment does not exist', async () => {
    const response = await request(app)
      .put('/v1/fragments/non-existent-id')
      .set('Authorization', 'Bearer test-token')
      .set('Content-Type', 'text/plain')
      .send('This is updated data');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(createErrorResponse(404, 'Fragment not found'));
  });

  it('should return 400 if the Content-Type does not match the existing fragment type', async () => {
    const response = await request(app)
      .put(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token')
      .set('Content-Type', 'application/json') // Different content type
      .send(JSON.stringify({ key: 'value' }));

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      createErrorResponse(400, "Content-Type does not match the fragment's type")
    );
  });

  it('should return 500 if there is an error while updating the fragment', async () => {
    jest.spyOn(Fragment.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .put(`/v1/fragments/${testFragment.id}`)
      .set('Authorization', 'Bearer test-token')
      .set('Content-Type', 'text/plain')
      .send('This is updated data');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(createErrorResponse(500, 'Internal Server Error'));

    // Restore the original implementation of the save method
    Fragment.prototype.save.mockRestore();
  });
});
