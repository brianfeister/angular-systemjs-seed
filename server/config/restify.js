/**
 * Restify configuration
 */

'use strict';

var restify = require('restify');
var connect = require('connect');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

module.exports = function(api) {
  var env = config.env;

  api.acceptable.push('html'); // html is not part of 'acceptable' array by default
  api.use(restify.acceptParser(api.acceptable));
  api.use(restify.queryParser());
  api.use(restify.bodyParser());
  api.use(morgan('dev')); // logging
  api.use(restify.CORS()); // CORS

  api.on('NotFound', function (req, res, cb) {
    res.send(404);
  });

  api.on('ResourceNotFound', function (req, res, cb) {
    res.send(404);
  });

  // Persist sessions with mongoStore
  // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  // api.use(session({
  //   secret: config.secrets.session,
  //   resave: true,
  //   saveUninitialized: true,
  //   store: new mongoStore({ mongoose_connection: mongoose.connection })
  // }));

  if ('production' === env) {
    api.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    // api.use(express.static(path.join(config.root, 'public')));
    // api.set('appPath', path.join(config.root, 'public'));
    api.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    // api.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    // @TODO remove this if we decide not to use
    api.get(/.*/, restify.serveStatic({
      'directory': 'client',
      'default': 'index.html'
    }));

    api.use(require('connect-livereload')()); // @TODO make this work
    // @TODO use these for serving compiled LESS from .tmp directory in dev
    // api.get(/.tmp/, restify.serveStatic({'directory': '.tmp' }));
    // api.get(/client/, restify.serveStatic({'directory': 'client' }));

    api.use(morgan('dev'));
  }

};
