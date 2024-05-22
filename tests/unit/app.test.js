const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
  test('404 for unknown routes', async () => {
    const response = await request(app).get('/test-route');
    expect(response.status).toEqual(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
