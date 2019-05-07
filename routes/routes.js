const process = require('process'),
    fs = require('fs-extra'),
    path = require('path');

// App router
const router = function (app) {

    app.get('/', (req, res) => {
        res.redirect('https://unglue.io');
    });

    app.post('/compile/css', require('./css'));

    app.post('/compile/js', require('./js'));

    app.post('/compile/svg-sprite', require('./svg-sprite'));

};

module.exports = router;