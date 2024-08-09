// src/route/api/getID.js

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
const md = require('markdown-it')();

module.exports = async (req, res) => {
  const pathURL = path.parse(req.params.id);
  const ext = pathURL.ext.slice(1) || '';
  const id = pathURL.name;
  const ownerId = req.user;

  logger.info({ ext, id }, 'Extension and ID passed in the URL');

  try {
    const frags = await Fragment.byId(ownerId, id);
    let data = await frags.getData();

    if (ext) {
      // Handle supported conversions based on fragment type
      switch (frags.type) {
        case 'text/markdown':
          if (ext === 'md') {
            data = md.render(data.toString());
            res.set('Content-Type', 'text/html');
            res.status(200).send(data);
          } else if (ext === 'txt') {
            res.set('Content-Type', 'text/plain');
            res.status(200).send(data);
          } else {
            res
              .status(415)
              .json(createErrorResponse(415, 'Unsupported conversion type for markdown'));
          }
          break;

        case 'text/plain':
          if (ext === 'txt') {
            res.set('Content-Type', 'text/plain');
            res.status(200).send(data);
          } else {
            res
              .status(415)
              .json(createErrorResponse(415, 'Unsupported conversion type for plain text'));
          }
          break;

        case 'text/html':
          if (ext === 'html') {
            res.set('Content-Type', 'text/html');
            res.status(200).send(data);
          } else if (ext === 'txt') {
            res.set('Content-Type', 'text/plain');
            res.status(200).send(data);
          } else {
            res.status(415).json(createErrorResponse(415, 'Unsupported conversion type for HTML'));
          }
          break;

        case 'image/png':
        case 'image/jpeg':
        case 'image/webp':
        case 'image/avif':
        case 'image/gif':
          if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'].includes(ext)) {
            res.set('Content-Type', `image/${ext}`);
            res.status(200).send(data);
          } else {
            res.status(415).json(createErrorResponse(415, 'Unsupported conversion type for image'));
          }
          break;

        case 'application/json':
          if (ext === 'json') {
            res.set('Content-Type', 'application/json');
            res.status(200).send(data);
          } else if (ext === 'txt') {
            res.set('Content-Type', 'text/plain');
            res.status(200).send(data);
          } else {
            res.status(415).json(createErrorResponse(415, 'Unsupported conversion type for JSON'));
          }
          break;

        case 'application/yaml':
          if (ext === 'yaml' || ext === 'yml') {
            res.set('Content-Type', 'application/yaml');
            res.status(200).send(data);
          } else if (ext === 'txt') {
            res.set('Content-Type', 'text/plain');
            res.status(200).send(data);
          } else {
            res.status(415).json(createErrorResponse(415, 'Unsupported conversion type for YAML'));
          }
          break;

        default:
          res.status(415).json(createErrorResponse(415, 'Unknown or unsupported type'));
          break;
      }
    } else {
      // No extension provided, return raw data
      res.set('Content-Type', frags.type);
      res.status(200).send(data);
    }
  } catch (error) {
    logger.warn({ errorMessage: error.message }, 'Request to non-existent fragment was made');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
