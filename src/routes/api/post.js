// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = require('../../response');

// Create a new fragment
const createFragment = async (req, res) => {
  const { body } = req;
  const ownerId = req.user;

  // Parse Content-Type header
  const type = req.get('Content-Type');

  logger.info({ ownerId, type }, `Calling POST ${req.originalUrl}`);

  // Check if the type is supported
  if (!Fragment.isSupportedType(type)) {
    const errorResponse = createErrorResponse(415, 'Unsupported content type');
    logger.warn({ errorResponse }, 'Failed to create a new fragment');
    return res.status(415).json(errorResponse);
  }

  try {
    const fragment = new Fragment({ ownerId, type });
    await fragment.setData(body);
    await fragment.save();

    const baseUrl = process.env.API_URL || req.headers.host;
    const location = `${baseUrl}/v1/fragments/${fragment.id}`;

    res.set('Location', location);
    res.set('Access-Control-Expose-Headers', 'Location');

    const successResponse = createSuccessResponse({ fragment });
    logger.debug({ successResponse }, 'A new fragment has been created');

    res.status(201).json(successResponse);
  } catch (err) {
    logger.error('Failed to create fragment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = createFragment;
