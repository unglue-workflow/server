// App router
const router = function (app) {
    const CssController = require('../controller/CssController');
    const JsController = require('../controller/JsController');

    app.get('/', function(req, res) {
        res.status(200).send('Available Endpoints (POST): /compile/scss, /compile/js');
    });

    app.post('/compile/css', function(req, res) {
        const controller = new CssController(req, res);
        const result = controller.compile();
        
        res.json(result);
    });

    app.post('/compile/js', function(req, res) {
        const controller = new JsController(req, res);
        const result = controller.compile();
        
        res.json(result);
    });
    
};

module.exports = router;