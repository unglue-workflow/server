const path = require('path'),
      express = require('express'),
      bodyParser = require('body-parser');

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
    res.json({ message: error.message });
});

const server = app.listen(3000, function () {
    console.log("Server running on port " + server.address().port);
});