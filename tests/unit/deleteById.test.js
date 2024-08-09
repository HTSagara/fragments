const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const deleteById = require('../../src/routes/api/deleteById');
const { Fragment } = require('../../src/model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../src/response');
const logger = require('../../src/logger');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = 'test-owner-id';
  next();
});

app.delete('/v1/fragments/:id', deleteById);

// Mock logger to avoid actual logging during tests
jest.mock('../../src/logger', () => ({
  error: jest.fn(),
}));

describe('DELETE /v1/fragments/:id', () => {
  let fragment;

  // Helper function to create a fragment in the database
  async function createTestFragment() {
    fragment = new Fragment({
      ownerId: 'test-owner-id',
      type: 'text/plain',
      size: 20,
    });
    await fragment.save();
    await fragment.setData(Buffer.from('This is a test fragment'));
    return fragment;
  }

  beforeEach(async () => {
    await createTestFragment();
  });

  it('should delete an existing fragment and return a success message', async () => {
    const response = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      createSuccessResponse({
        status: 'ok',
        message: `Fragment ${fragment.id} was deleted`,
      })
    );

    // Ensure the fragment is actually deleted
    try {
      await Fragment.byId('test-owner-id', fragment.id);
    } catch (err) {
      expect(err.message).toBe(`Fragment not found: ownerId=test-owner-id, id=${fragment.id}`);
    }
  });

  it('should return 500 Internal Server Error if deletion fails', async () => {
    // Mock the Fragment.delete method to throw an error
    jest.spyOn(Fragment, 'delete').mockImplementation(() => {
      throw new Error('Deletion failed');
    });

    const response = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual(createErrorResponse(500, 'Internal Server Error'));

    // Check that the logger was called with the appropriate error message
    expect(logger.error).toHaveBeenCalledWith('Failed to delete fragment', expect.any(Error));
  });
});
