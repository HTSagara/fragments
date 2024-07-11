// src/routes/api/getById.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const { id, ext } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    let data = await fragment.getData();

    res.set('Content-Type', fragment.type);
    res.send(data);
  } catch (err) {
    logger.error(err);
    logger.error(`Error converting fragment ${id} to ${ext}: ${err.message}`);
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
