// App router
const router = function (app) {
    const CssController = require('../controller/CssController');
    const JsController = require('../controller/JsController');
    const SvgSpriteController = require('../controller/SvgSpriteController');

    const compile = (controllerName, req, res) => {
        let Controller = require('../controller/' + controllerName);
        let Controller = new Controller(req, res);
        return Controller.compile();
    };

    app.get('/', function(req, res) {
        res.status(200).send('Available Endpoints (POST): /compile/scss, /compile/js');
    });

    app.post('/compile/css', function(req, res) {
        const result = compile('CssController', req, res);
        res.json(result);
    });

    app.post('/compile/js', function(req, res) {
        const result = compile('JsController', req, res);
        res.json(result);
    });

    app.post('/compile/svg-sprite', function(req, res) {
        const result = compile('SvgSpriteController', req, res);
        res.json(result);
    });
    
};

module.exports = router;