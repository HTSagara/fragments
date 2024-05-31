const { Fragment } = require('../model/fragment');
const contentType = require('content-type');
const { URL } = require('url');

const post = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Unauthorized');
    }

    const ownerId = req.user.id;
    const { type } = contentType.parse(req);

    if (!Fragment.isSupportedType(type)) {
      console.error(`Unsupported type: ${type}`);
      return res.status(415).send('Unsupported Media Type');
    }

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).send('Bad Request');
    }

    const fragment = new Fragment({ ownerId, type });
    await fragment.setData(req.body);
    await fragment.save();

    const location = new URL(
      `/fragments/${fragment.id}`,
      process.env.API_URL || `http://${req.headers.host}`
    ).toString();
    res.status(201).location(location).json(fragment);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = post;
