var express = require('express'),
  fs = require('fs'),
  app = express(),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000;

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var routes = require('./api/routes/compile');
routes(app);

var path = require('path');
global.appRoot = path.resolve(__dirname);

app.listen(port);

console.log('RESTful API server started on: ' + port);