const { Fragment } = require('../../model/fragment');
const contentType = require('content-type');
const logger = require('../../logger');

// Create a new fragment
const createFragment = async (req, res) => {
  const { headers, body } = req;

  // Parse Content-Type header
  let parsedType;
  try {
    parsedType = contentType.parse(headers['content-type']);
  } catch (error) {
    logger.error('Failed to parse content-type', error);
    return res.status(400).send({ error: 'Invalid Content-Type header' });
  }

  // Check if the type is supported
  if (!Fragment.isSupportedType(parsedType.type)) {
    logger.error('Unsupported content type', parsedType.type);
    return res.status(415).send({ error: 'Unsupported content type' });
  }

  // Ensure the request body is a buffer
  if (!Buffer.isBuffer(body)) {
    return res.status(400).send({ error: 'Invalid body' });
  }

  try {
    // Create a new fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type: parsedType.type,
      size: body.length,
    });
    await fragment.save();
    await fragment.setData(body);

    // Construct the URL for the Location header
    const baseUrl = process.env.API_URL || `http://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl).toString();

    res
      .status(201)
      .location(location)
      .send({
        status: 'ok',
        fragment: {
          id: fragment.id,
          created: fragment.created,
          type: fragment.type,
          size: fragment.size,
          ownerId: fragment.ownerId,
        },
      });
  } catch (error) {
    logger.error('Failed to create fragment', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

module.exports = createFragment;
