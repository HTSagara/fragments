// src/routes/api/updateById.js

const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const incomingType = req.get('Content-Type');

    // Check if the Content-Type matches the existing fragment's type
    if (incomingType !== fragment.type) {
      return res
        .status(400)
        .json(createErrorResponse(400, "Content-Type does not match the fragment's type"));
    }

    // Update the fragment's data
    await fragment.setData(req.body);
    await fragment.save();

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    if (err.message.includes('Fragment not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    logger.error('Failed to update fragment', err);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
