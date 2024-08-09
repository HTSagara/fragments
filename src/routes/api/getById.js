const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const path = require('path');
const sharp = require('sharp');

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
      if (ext === 'md') {
        const htmlData = await frags.convertTo('html');
        res.set('Content-Type', 'text/html');
        res.status(200).send(htmlData);
      } else if (ext === 'png' || ext === 'jpeg') {
        const imageFormat = ext === 'png' ? 'png' : 'jpeg';
        const convertedImage = await sharp(data).toFormat(imageFormat).toBuffer();

        res.set('Content-Type', `image/${imageFormat}`);
        res.status(200).send(convertedImage);
      } else {
        res.status(415).json(createErrorResponse(415, 'Unknown or unsupported type'));
      }
    } else {
      res.set('Content-Type', frags.type);
      res.status(200).send(data);
    }
  } catch (error) {
    logger.warn({ errorMessage: error.message }, 'request to non-existent fragment was made');
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};
