// App router
const router = function (app) {
    const cssController = require('../controller/cssController');

    app.get('/', function(req, res) {
        res.status(200).send('Available Endpoints (POST): /compile/scss, /compile/js');
    });

    app.post('/compile/scss', cssController.handleRequest);
};

module.exports = router;