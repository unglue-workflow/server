const http = require('http'),
      https = require('https'),
      path = require('path'),
      express = require('express'),
      bodyParser = require('body-parser'),
      argv = require('yargs').argv,
      morgan = require('morgan');

// Define "appRoot" in global namespace
global.appRoot = path.resolve(__dirname);

// Require the routes file
const routes = require('./routes/routes.js');

// Initialize express
const app = express();

// Accept JSON and urlencoded values
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Log requests
app.use(morgan(':method :url :response-time ms'));

// Router
routes(app);

// Don't print console info if not verbose
if(!argv['v'] && !argv['verbose']) {
    console.info = function() {};
}

// Custom error handler
app.use(function(error, req, res, next) {
    if(res.statusCode === 200) {
        res.status(500);
    }
    console.log(error);
    res.json({ message: error.message });
});

const server = http.createServer(app).listen(argv['port'] ? argv['port'] : 3000, function() {
    console.log("Server running on port " + server.address().port);
});