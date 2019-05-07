const babelCore = require('@babel/core'),
    uglifyJs = require('uglify-js'),
    path = require('path'),
    errorHelper = require('../helper/error-helper');

const BaseController = require('./BaseController');

class JsController extends BaseController {

    constructor() {
        super();
        this.name = 'js';
    }

    babel(Data) {
        return new Promise((resolve, reject) => {
            const options = Data.getOption(this.name).babel;
            options.minified = false;
            options.inputSourceMap = false;
            options.sourceMaps = Data.getOption('maps');

            const transformations = [];

            Data.getFiles().forEach(File => {
                transformations.push((Data) => {
                        return new Promise((resolve, reject) => {
                            // Set the required params – these can't be changed through the user
                            options.sourceFileName = path.basename(File.getRelativePath());
                            options.sourceRoot = path.dirname(File.getRelativePath());

                            babelCore.transformAsync(File.getCode(true), options).then(result => {
                                Data.addCode(File.getPath(), result.code);

                                if(Data.getOption('maps')) {
                                    Data.addMap(File.getPath(), result.map);
                                }
                
                                resolve(Data);
                            }).catch(error => {
                                reject(error);
                            });
                        });
                    }
                );
            });

            // Build a promise chain from the promise array
            let promise = transformations[0](Data);
            for (let i = 1; i < transformations.length; i++) {
                promise = promise.then(Data => transformations[i](Data));
            }

            // Resolve or reject the promise based on the results from
            // the promise chain
            promise
                .then(Data => {
                    resolve(Data);
                 })
                .catch(error => {
                    reject(error);
                });
        });
    }

    uglify(Data) {
        return new Promise((resolve, reject) => {
            const compiled = Data.getCompiled();
            const options = Data.getOption(this.name).uglifyjs;

            if(Data.getOption('maps')) {
                options.sourceMap = {
                    filename: Data.getParam('distFile'),
                    url: Data.getParam('distFile') + '.map',
                    content: compiled.getMap() ? compiled.getMap() : null
                };
            }

            const result = uglifyJs.minify(compiled.getCode(), options);

            if(result.error) {
                reject(result.error);
            } else {
                Data.addCode('main', result.code);
                if(Data.getOption('maps')) {
                    Data.addMap('main', result.map);
                }

                resolve(Data);
            }
        });
    }

    concat(Data) {
        return new Promise((resolve) => {
            Data.getFiles().forEach(File => {
                Data.addCode(File.path, File.code);
            });

            resolve(Data);
        });
    }

    async compile(Data) {
        const defaultOptions = {
            babel: {
                sourceType: "script",
                presets: [
                    [
                        "@babel/env",
                        {
                            targets: {
                                browsers: [
                                    "> 0.5%",
                                    "last 2 versions",
                                    "IE 10"
                                ]
                            },
                            "modules": false
                        },
                    ]
                ]
            },
            uglifyjs: {}
        };

        return this.prepare(Data, ['distFile'], defaultOptions)
            .then(Data => {
                if(Data.getOption(this.name).babel) {
                    return this.babel(Data);
                }

                return this.concat(Data);
            })
            .then(Data => {
                if(Data.getOption('compress', true) && !!Data.getOption(this.name).uglifyjs) {
                    return this.uglify(Data);
                }

                return Data;
            })
            .catch(error => {
                throw errorHelper(error);
            });
    }

}

module.exports = JsController;