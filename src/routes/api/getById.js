// src/route/api/getID.js

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
// const md = require('markdown-it')();

module.exports = async (req, res) => {
  // separating the ID and extension from the URL
  const pathURL = path.parse(req.params.id);

  const ext = pathURL.ext.slice(1) || '';
  const id = pathURL.name;
  const ownerId = req.user;
  logger.info({ ext, id }, 'Extension and ID passed in the URL');
  try {
    // Looking for the user id in the current fragment data
    const frags = await Fragment.byId(ownerId, id);
    let data = await frags.getData();

    // returns an existing fragment's data converted to a supported type.
    // Initially, you only need to support Markdown fragments (.md) converted to HTML (.html) using markdown-it

    // Check if it has a .md extension
    if (ext) {
      if (ext === 'md') {
        // Changes the content type to html
        res.set('Content-Type', 'text/html');
        res.status(200).send(data);
      } else {
        // If the extension used represents an unknown or unsupported type,
        // or if the fragment cannot be converted to this type, an HTTP 415 error is returned
        res.status(415).json(createErrorResponse(415, 'Unknown or unsupported type'));
      }
    } else {
      res.set('Content-Type', frags.type);
      res.status(200).send(data);
      return;
    }
  } catch (error) {
    logger.warn({ errorMessage: error.message }, 'request to non-existent fragment was made');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
