// App router
const router = function (app) {
    const cssController = require('../controller/cssController');
    const jsController = require('../controller/jsController');

    app.get('/', function(req, res) {
        res.status(200).send('Available Endpoints (POST): /compile/scss, /compile/js');
    });

    app.post('/compile/scss', cssController.handleRequest);
    app.post('/compile/js', jsController.handleRequest);
};

module.exports = router;