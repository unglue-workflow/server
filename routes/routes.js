const process = require('process'),
    fs = require('fs-extra'),
    path = require('path');

// App router
const router = function (app) {
    const compile = (controllerName, req, res) => {
        return new Promise((resolve, reject) => {
            let Controller = require('../controller/' + controllerName);
            Controller = new Controller(req.body);

            Controller.compile()
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                });
        });
    };

    app.get('/', (req, res) => {
        res.redirect('https://unglue.io');
    });

    app.post('/compile/css', (req, res) => {
        let Data = require('../models/Data');
        let ScssController = require('../controller/ScssController');
        let CssController = require('../controller/CssController');

        Data = new Data('css', ['distFile', 'mainFiles'], req.body);

        ScssController = new ScssController();
        CssController = new CssController();

        ScssController.compile(Data)
            .then(Data => CssController.compile(Data))
            .then(Data => {

                console.log(Data);

                res.json({
                    code: Data.getCompiledCode(ensureOrder = true),
                    map: Data.getCompiledMap(ensureOrder)
                })
            })
            .catch(error => {
                let githubIssue = 'https://github.com/unglue-workflow/server/issues/new?';

                if (typeof error === 'object') {
                    githubIssue += `title=${encodeURIComponent('Error: ' + error.message)}`;
                    githubIssue += `&body=${encodeURIComponent(error.stack)}`;
                } else {
                    githubIssue += `title=${encodeURIComponent('Error: '+ error)}`;
                }

                console.error(error);
                res.status(500);
                res.json({
                    message: typeof error == 'string' ? error : error.message,
                    // Replace base dir in stack to not expose to much information
                    stack: error.stack ? error.stack.replace(new RegExp(`${global.appRoot}`, 'g'), '') : '',
                    githubIssue: githubIssue
                });
            });
    });

    app.post('/compile/js', (req, res) => {
        const result = compile('JsController', req, res);
        res.json(result);
    });

    app.post('/compile/svg-sprite', (req, res) => {
        const result = compile('SvgSpriteController', req, res);
        res.json(result);
    });

};

module.exports = router;