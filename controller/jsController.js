const babelCore = require('babel-core'),
      uglifyJs = require('uglify-js');

const browserlist = [
    "> 0.5%",
    "last 2 versions",
    "IE 10"
];

const babel = (js) => {
    let result = babelCore.transform(js, {
        minified: false,
        presets: [
            [
                "env",
                {
                    targets: {
                        browsers: browserlist
                    }
                }
            ]
        ]
    });

    return result.code;
};

const uglify = (js) => {
    return uglifyJs.minify(js);
};

const concatJs = (files) => {
    let js = '';
    for (let index in files) {
        const file = files[index];
        js += file.content;
    }
    return js;
};

const compile = (files, res, options) => {
    let js = concatJs(files);
    js = babel(js);

    if(options.compress) {
        js = uglify(js);
    }

    res.json({
        js: js
    });
};

exports.handleRequest = (req, res, next) => {
    if(!req.body.files) {
        res.status(400);
        throw new Error('No files received!');
    }

    const options = {
        compress: true,
        maps: false
    };

    if(req.body.options) {
        for (let key in req.body.options) {
            if(typeof options[key] !== 'undefined') {
                options[key] = req.body.options[key];
            }
        }
    }

    const files = req.body.files;

    compile(files, res, options);
};