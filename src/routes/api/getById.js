// src/route/api/getID.js

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');

module.exports = async (req, res) => {
  // Extract the ID and extension from the URL
  const { ext, name: id } = path.parse(req.params.id);
  const ownerId = req.user;

  logger.info({ ext, id }, 'Received request to get fragment with ID and extension');

  try {
    // Retrieve the fragment by ID and ownerId
    const fragment = await Fragment.byId(ownerId, id);
    let data = await fragment.getData();

    // If an extension is provided, attempt to convert the fragment
    if (ext) {
      // Attempt to convert the fragment based on its type and the extension
      const convertedData = await Fragment.convertFragment(fragment, ext);
      if (convertedData) {
        res.set('Content-Type', convertedData.mimeType);
        res.status(200).send(convertedData.data);
      } else {
        // Unsupported conversion
        res.status(415).json(createErrorResponse(415, 'Unsupported conversion type'));
      }
    } else {
      // No conversion needed, return the original data
      res.set('Content-Type', fragment.type);
      res.status(200).send(data);
    }
  } catch (error) {
    logger.warn({ errorMessage: error.message }, 'Fragment not found');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
