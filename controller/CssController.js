const postcss = require('postcss'),
    path = require('path'),
    errorHelper = require('../helper/error-helper');

const BaseController = require('./BaseController');

class CssController extends BaseController {

    constructor() {
        super();
        this.name = 'css';
    }
    
    postcss(Data) {
        return new Promise((resolve, reject) => {
            const cssOptions = Data.getOption(this.name);

            let autoprefixerOptions = cssOptions.autoprefixer,
                cssmqpackerOptions = cssOptions.cssmqpacker,
                cssnanoOptions = cssOptions.cssnano;

            if (typeof autoprefixerOptions != 'object') {
                autoprefixerOptions = {};
            }
            if (cssmqpackerOptions === true) {
                cssmqpackerOptions = {};
            }
            if (cssnanoOptions === true) {
                cssnanoOptions = {};
            }

            // Get all css files
            const files = Data.getFiles().filter(value => {
                return path.extname(value.path) === '.css';
            });

            // Add the css files to Data.compiled
            files.forEach(file => {
                Data.addCode(file.path, file.code);
            });

            const processOptions = {
                from: undefined,
                map: {
                    inline: false
                },
                to: Data.getParam('distFile')
            };

            const postCssPlugins = [ 
                require('autoprefixer')(autoprefixerOptions)
            ];

            if(cssmqpackerOptions !== false) {
                postCssPlugins.push(require("css-mqpacker")(cssmqpackerOptions));
            }

            if(Data.getOption('compress') && cssnanoOptions !== false) {
                postCssPlugins.push(require('cssnano')(cssnanoOptions));
            }

            postcss(postCssPlugins)
                .process(Data.getCompiled(true).getCode(true), processOptions)
                .then(result => {
                    result.warnings().forEach((warn) => {
                        Data.addLogMessage('PostCSS Warning: ' + warn);
                    });

                    Data.addCode(Data.getParam('distFile'), result.css);

                    if(Data.getOption('maps', false)) {
                        Data.addMap(Data.getParam('distFile'), result.map.toJSON());
                    }

                    resolve(Data);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    async compile(Data) {
        const defaultOptions = {
            autoprefixer: true,
            cssmqpacker: false,
            cssnano: true
        };

        return this.prepare(Data, ['distFile', 'mainFiles'], defaultOptions)
            .then(Data => this.postcss(Data))
            .catch(error => {
                throw errorHelper(error);
            });
    }

}

module.exports = CssController;