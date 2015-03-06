/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var restify = require('restify');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup API server
var api = restify.createServer();

// Setup static server
// var app = express();
// var server = require('http').createServer(app);

// var socketio = require('socket.io')(server, {
//   serveClient: config.env !== 'production',
//   path: '/socket.io-client'
// });

// require('./config/socketio')(socketio);
require('./config/restify')(api);
// require('./config/express')(app);
// require('./routes')(app);

// Start API server
api.listen(config.port, function () {
  console.log('Restify API server listening on %d, in %s mode', config.port, config.env);
});

// Start static server
// server.listen(config.port, config.ip, function () {
//   console.log('Express staic server listening on %d, in %s mode', config.port, app.get('env'));
// });

// Expose api
exports = module.exports = api;

// Expose static server
// exports = module.exports = app;
