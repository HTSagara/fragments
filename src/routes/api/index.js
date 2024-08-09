// src/routes/api/index.js
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const createFragment = require('./post');
const getFragmentById = require('./getById');
const getFragmentInfoById = require('./getByIdInfo');
const deleteById = require('./deleteById');
const updateById = require('./updateById');

require('../../auth/basic-auth');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));
router.get('/fragments/:id', getFragmentById);
router.get('/fragments/:id/info', getFragmentInfoById);

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
router.post('/fragments', rawBody(), createFragment);

router.put('/fragments/:id', rawBody(), updateById);

// Route to delete by id
router.delete('/fragments/:id', deleteById);

module.exports = router;
