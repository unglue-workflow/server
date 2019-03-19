const fs = require('fs-extra'),
    postcss = require('postcss'),
    path = require('path'),
    postcssAutoprefixer = require('autoprefixer');

const BaseController = require('./BaseController');

class CssController extends BaseController {

    constructor() {
        super();
        this.name = 'css';
    }
    
    postcss(Data) {
        return new Promise((resolve, reject) => {
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

            postcss([postcssAutoprefixer])
                .process(Data.getCompiled(true).getCode(true), processOptions)
                .then(result => {
                    Data.addCode(Data.getParam('distFile'), result.css).addMap(Data.getParam('distFile'), result.map);
                    resolve(Data);
                })
        });  
    }

    async compile(Data) {
        return this.prepare(Data, ['distFile', 'mainFiles'])
            .then(this.postcss);
    }

}

module.exports = CssController;