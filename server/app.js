'use strict';

var express = require('express');
var path = require('path');

import bodyParser from 'body-parser';
import expressRequestId from 'express-request-id';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import createReduxStore from '../modules/store';

import auth from './apis/auth';
import logger from './libs/logger';
import session from './libs/session';
import userMiddleware from './libs/userMiddleware';

import App from '../src/containers/App';

const file = 'server/app.js';

const app = express();

app.use(expressRequestId());
app.use(bodyParser.json()); // for parsing POST body
app.use(session.createSessionMiddleware());
app.use(logger);
app.use(express.static(path.join(__dirname, './public')));

const handleRequest = (req, res) => {
  req.log.info({ file, function: 'handleRequest', url: req.url, session: req.session, user: req.user });

  const context = {};

  // counter in session for demo
  if (!req.session.counter) req.session.counter = 0;
  req.session.counter++;

  const initialState = session.createInitialReduxState(req.log, req.session, req.user);
  const store = createReduxStore(initialState);

  const appHtml = renderToString(
    <Provider store={store}>
      <StaticRouter
        location={req.url}
        context={context}>
        <App/>
      </StaticRouter>
    </Provider>
  );

  if (context.url) {
    res.redirect(302, context.url);
  } else {
    res.send(renderPage(appHtml, store.getState()));
  }
};

app.get('*', (req, res) => {
  req.log.info({ file, function:'get *', url: req.url, session: req.session });

  // Call userMiddleware here only rather than register it by app.use().
  // It is to reduce uncessary user db call.
  // Once a function is registered by app.use, it is called even for asset request.
  userMiddleware(req)
    .then(() => handleRequest(req, res));
});

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

function renderPage(appHtml, initialState) {
  return `
    <!doctype html public="storage">
    <html>
    <meta charset=utf-8/>
    <title>helloworld-lambda-web</title>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css">
    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap-theme.min.css">
    <div id=app>${appHtml}</div>
    <script>
      window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
    </script>
    <script src="/bundle.js"></script>
  `;
}

// Export your express server so you can import it in the lambda function.
module.exports = app;
