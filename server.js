const http = require('http'),
      https = require('https'),
      path = require('path'),
      express = require('express'),
      bodyParser = require('body-parser'),
      argv = require('yargs').argv;

// Define "appRoot" in global namespace
global.appRoot = path.resolve(__dirname);

// Require the routes file
const routes = require('./routes/routes.js');

// Initialize express
const app = express();

// Accept JSON and urlencoded values
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Router
routes(app);

// Custom error handler
app.use(function(error, req, res, next) {
    if(res.statusCode === 200) {
        res.status(500);
    }
    console.log(error);
    res.json({ message: error.message });
});

const httpServer = http.createServer(app).listen(argv['http'] ? argv['http'] : 3000, function() {
    console.log("Server running on port " + httpServer.address().port);
});


if(argv['https']) {
    const keyCert = {};

    const httpsServer = https.createServer(keyCert, app).listen(argv['https'], function() {
        console.log("Server running on port " + httpsServer.address().port);
    });
}