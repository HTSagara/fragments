const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

const getFragmentInfoById = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  if (!ownerId) {
    return res.status(400).json(createErrorResponse(400, 'Bad Request'));
  }

  try {
    const fragment = await Fragment.byId(ownerId, id);

    res.status(200).json(
      createSuccessResponse({
        status: 'ok',
        fragment: fragment,
      })
    );
  } catch (err) {
    if (err.message.includes('Fragment not found')) {
      res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
  }
};

module.exports = getFragmentInfoById;
