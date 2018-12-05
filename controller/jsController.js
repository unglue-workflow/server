const fs = require('fs-extra'),
      babelCore = require('babel-core'),
      crypto = require('crypto'),
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

const compile = (files, res) => {
    let js = concatJs(files);
    js = babel(js);
    js = uglify(js);

    res.json({
        js: js
    });
};

exports.handleRequest = (req, res, next) => {
    if(!req.body.files) {
        res.status(400);
        throw new Error('No files received!');
    }

    const files = req.body.files;

    compile(files, res);
};