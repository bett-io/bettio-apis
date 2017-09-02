'use strict';

var express = require('express');
var path = require('path');

import bodyParser from 'body-parser';
import expressRequestId from 'express-request-id';

import auth from './apis/auth';
import logger from './libs/logger';
import session from './libs/session';
import userMiddleware from './libs/userMiddleware';

const file = 'server/app.js';

const app = express();

app.use(expressRequestId());
app.use(bodyParser.json()); // for parsing POST body
app.use(session.createSessionMiddleware());
app.use(logger);
app.use(express.static(path.join(__dirname, './public')));

app.post('/signin', (req, res) => {
  req.log.info({ file, function:'post', req: { url: req.url } });

  auth.signin(req)
    .then((result) => res.send(result))
    .catch((error) => {
      req.log.info({ file, function: 'post', error });
      res.status(403).send(error);
    });
});

app.post('/signout', (req, res) => {
  req.log.info({ function:'app.post', req: { url: req.url } });

  res.send(auth.signout(req, res));
});

// Export your express server so you can import it in the lambda function.
module.exports = app;
