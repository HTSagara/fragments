// src/routes/api/getById.js

const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const getFragmentInfoById = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);

    createSuccessResponse(
      res.status(200).json({
        status: 'ok',
        fragment: fragment,
      })
    );
  } catch (err) {
    if (err.message.includes('Fragment not found')) {
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    } else {
      res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
  }
};

module.exports = getFragmentInfoById;
