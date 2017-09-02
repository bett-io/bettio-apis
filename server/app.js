'use strict';

var express = require('express');
var path = require('path');

import bodyParser from 'body-parser';
import expressRequestId from 'express-request-id';
import logger from './libs/logger';
import ping from './apis/ping';
import session from './libs/session';

const app = express();

app.use(expressRequestId());
app.use(bodyParser.json()); // for parsing POST body
app.use(session.createSessionMiddleware());
app.use(logger);
app.use(express.static(path.join(__dirname, './public')));

ping(app);

// Export your express server so you can import it in the lambda function.
module.exports = app;
