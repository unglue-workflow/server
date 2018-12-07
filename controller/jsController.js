const babelCore = require('babel-core'),
      uglifyJs = require('uglify-js'),
      concat = require('source-map-concat'),
      createDummySourceMap = require('source-map-dummy');


const browserlist = [
    "> 0.5%",
    "last 2 versions",
    "IE 10"
];

const babel = (js) => {
    let result = babelCore.transform(js.code, {
        minified: false,
        inputSourceMap: js.map.toJSON(),
        sourceMaps: true,
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

    return {
        code: result.code,
        map: result.map
    };
};

const uglify = (js, distFile) => {
    return uglifyJs.minify(js.code, {
        sourceMap: {
            filename: distFile,
            url: `${distFile}.map`,
            content: js.map
        }
    });
};

const concatJs = (files) => {
    let js = '';

    files = files.map(function(file) {
        return {
            source: file.file,
            code: file.code,
            map: file.map ? file.map : false
        }
    });

    files.forEach( function(file) {
        if (!file.map) {
            file.map = createDummySourceMap(file.code, {source: file.source, type: "js"});
        }
    })

    const concatenated = concat(files);
    const result = concatenated.toStringWithSourceMap();

    return {
        code: result.code,
        map: result.map
    };
};

const compile = (distFile, files, res, options) => {
    let js = concatJs(files, 'main.js');
    js = babel(js);

    if(options.compress) {
        js = uglify(js, distFile);
    } else {
        js.code += `\n//# sourceMappingURL=${distFile}.map`;
        js.map = JSON.stringify(js.map);
    }

    res.json({
        code: js.code,
        map: js.map
    });
};

exports.handleRequest = (req, res, next) => {
    if(!req.body.distFile) {
        res.status(400);
        throw new Error('No distFile received!');
    }
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

    compile(req.body.distFile, req.body.files, res, options);
};