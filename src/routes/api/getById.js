// src/routes/api/getById.js

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const getFragmentById = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const data = await fragment.getData();
    res.set('Content-Type', fragment.type);
    res.send(data);
  } catch (err) {
    if (err.message.includes('Fragment not found')) {
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    } else {
      res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
  }
};

module.exports = getFragmentById;
