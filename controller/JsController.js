const babelCore = require('@babel/core'),
    uglifyJs = require('uglify-js');

const BaseController = require('./BaseController');

class JsController extends BaseController {
    
    babel(Data) {
        return new Promise((resolve, reject) => {
            const compiled = Data.getCompiled();
            const userOptions = Data.getOption('css', {});

            // These are the default options, can be overwritten through the request (options)
            let options = {
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
            };

            // If the babel options are set (options.css.babel), extend the default options
            if(userOptions.babel) {
                options = {
                    ...options,
                    ...userOptions.babel
                };
            }

            // Set the required params – these can't be changed through the user
            options.minified = false;
            options.inputSourceMap = Data.getOption('maps') ? JSON.parse(compiled.getMap()) : false;
            options.sourceMaps = Data.getOption('maps');

            const transformations = [];

            Data.getFiles().forEach(File => {
                transformations.push((Data) => {
                        return new Promise((resolve, reject) => {
                            babelCore.transformAsync(File.code, options).then(result => {
                                Data.addCode(File.path, result.code);
                
                                if(Data.getOption('maps')) {
                                    Data.addMap(File.path, result.map);
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

            let compileOptions = {};

            if (Data.getOption('maps')) {
                compileOptions.sourceMap = {
                    filename: Data.getParam('distFile'),
                    url: Data.getParam('distFile') + '.map',
                    content: compiled.getMap()
                };
            }

            const result = uglifyJs.minify(compiled.getCode(), compileOptions);

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

    async compile(Data) {
        return this.prepare(Data, ['distFile'])
            .then(Data => this.babel(Data))
            .then(Data => {
                if(Data.getOption('compress', true)) {
                    return this.uglify(Data);
                }

                return Data;
            })
            .catch(error => {
                throw error;
            });
    }

}

module.exports = JsController;