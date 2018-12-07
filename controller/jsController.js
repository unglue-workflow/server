const babelCore = require('babel-core'),
      uglifyJs = require('uglify-js'),
      concat = require('source-map-concat'),
      createDummySourceMap = require('source-map-dummy');


const browserlist = [
    "> 0.5%",
    "last 2 versions",
    "IE 10"
];

const babel = (js, options) => {
    let result = babelCore.transform(js.code, {
        minified: false,
        inputSourceMap: options.maps ? js.map.toJSON() : false,
        sourceMaps: options.maps,
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
        map: options.maps ? result.map : false
    };
};

const uglify = (js, distFile, options) => {
    let compileOptions = {};
    
    if(options.maps) {
        compileOptions = {
            sourceMap: {
                filename: distFile,
                url: `${distFile}.map`,
                content: js.map
            }
        };
    }

    return uglifyJs.minify(js.code, compileOptions);
};

const concatJs = (files) => {
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

const compile = (distFile, files, options) => {
    let js = concatJs(files, 'main.js');
    js = babel(js, options);

    if(options.compress) {
        js = uglify(js, distFile, options);
    } else if(options.maps) {
        js.code += `\n//# sourceMappingURL=${distFile}.map`;
        js.map = JSON.stringify(js.map);
    }

    return {
        code: js.code,
        map: options.maps ? js.map : false
    };
};

exports.compile = compile;

exports.handleRequest = (req, res, next) => {
    
    if(!req.body.distFile) {
        res.status(400);
        throw new Error('No distFile received!');
    }

    if(!req.body.files || req.body.files && req.body.files.length <= 0) {
        res.status(400);
        throw new Error('No files received!');
    }

    const options = {
        compress: true,
        maps: false
    };

    if(req.body.options) {
        options = { ...options, ...req.body.options };
    }

    const compiledData = compile(req.body.distFile, req.body.files, options);

    return res.json(compiledData);
};