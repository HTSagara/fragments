// src/routes/api/getById.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    const fragment = await Fragment.byId(ownerId, id);
    let data = await fragment.getData();

    // Handle conversion if requested
    const format = req.params.ext;
    if (format && fragment.formats.includes(`text/${format}`)) {
      data = await fragment.convertTo(format);
      res.set('Content-Type', `text/${format}`);
    } else {
      res.set('Content-Type', fragment.type);
    }

    res.send(data);
  } catch (err) {
    logger.error('Failed to get fragment by id', err);
    res.status(404).json({ error: 'Fragment not found' });
  }
};
