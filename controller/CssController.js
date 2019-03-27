const postcss = require('postcss'),
    path = require('path');

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
                cssMqpackerOptions = cssOptions.cssMqpacker,
                cssnanoOptions = cssOptions.cssnano;

            if (typeof autoprefixerOptions != 'object') {
                autoprefixerOptions = {};
            }
            if (cssMqpackerOptions === true) {
                cssMqpackerOptions = {};
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

            if(cssMqpackerOptions !== false) {
                postCssPlugins.push(require("css-mqpacker")(cssMqpackerOptions));
            }

            if(cssnanoOptions !== false) {
                postCssPlugins.push(require('cssnano')(cssnanoOptions));
            }

            postcss(postCssPlugins)
                .process(Data.getCompiled(true).getCode(true), processOptions)
                .then(result => {
                    result.warnings().forEach((warn) => {
                        Data.addLogMessage('PostCSS Warning: ' + warn);
                    });

                    // console.log(result.map.toJSON());

                    Data.addCode(Data.getParam('distFile'), result.css).addMap(Data.getParam('distFile'), result.map.toJSON());
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
            cssMqpacker: true,
            cssnano: true
        };

        return this.prepare(Data, ['distFile', 'mainFiles'], defaultOptions)
            .then(Data => this.postcss(Data));
    }

}

module.exports = CssController;