// src/routes/api/deleteById.js
const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

module.exports = async (req, res) => {
  const pathURL = path.parse(req.params.id);
  const id = pathURL.name;
  const ownerId = req.user;

  try {
    await Fragment.delete(ownerId, id);
    res.status(200).json(
      createSuccessResponse({
        status: 'ok',
        message: `Fragment ${id} was deleted`,
      })
    );
  } catch (err) {
    logger.error('Failed to delete fragment', err);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
