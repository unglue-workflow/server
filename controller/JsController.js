const babelCore = require('@babel/core'),
    uglifyJs = require('uglify-js');

const BaseController = require('./BaseController');

class JsController extends BaseController {

    constructor() {
        super();
        this.name = 'js';
    }

    babel(Data) {
        return new Promise((resolve, reject) => {
            const compiled = Data.getCompiled();
            const jsOptions = Data.getOption('js');

            const options = jsOptions.babel;

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
            const options = Data.getOption('js').uglifyjs;

            options.sourceMap = {
                filename: Data.getParam('distFile'),
                url: Data.getParam('distFile') + '.map',
                content: compiled.getMap()
            };

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
            }
        };

        return this.prepare(Data, ['distFile'], defaultOptions)
            .then(Data => {
                if(Data.getOption(this.name).babel) {
                    return this.babel(Data);
                }

                return Data;
            })
            .then(Data => {
                if(Data.getOption('compress', true) && Data.getOption(this.name).uglifyjs) {
                    return this.uglify(Data);
                }

                return Data;
            })
            .then(Data => {
                const jsOptions = Data.getOption(this.name);

                // If babel & uglify is disabled, concat the files
                if(!jsOptions.babel && !(jsOptions.uglifyjs && Data.getOption('compress'))) {
                    return this.concat(Data);
                }

                return Data;
            })
            .catch(error => {
                throw error;
            });
    }

}

module.exports = JsController;