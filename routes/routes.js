const pjson = require('../package.json');

// App router
const router = function (app) {

    const defaultResponse = (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            version: pjson.version,
            time: Date.now()
        }));
    };

    app.get('/', defaultResponse)
    app.post('/', defaultResponse)

    app.post('/compile/css', require('./css'));

    app.post('/compile/js', require('./js'));

    app.post('/compile/svg-sprite', require('./svg-sprite'));

};

module.exports = router;
