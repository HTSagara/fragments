// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    console.log(ownerId);
    // Fetch the fragments for the current user
    const fragments = await Fragment.byUser(ownerId);

    // Return the fragments in the response
    res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
