const fs = require('fs-extra'),
    sass = require('node-sass'),
    postcss = require('postcss'),
    path = require('path'),
    postcssAutoprefixer = require('autoprefixer');

const BaseController = require('./BaseController');

class CssController extends BaseController {

    async compile(Data) {
        return this.prepare(Data, ['distFile', 'mainFiles'])
            .then(Data => {
                return new Promise((resolve, reject) => {
                    Data.getParam('mainFiles').forEach(mainFile => {
                        if(path.extname(mainFile) === '.css') {
                            Data.addCode(mainFile, Data.getFile(mainFile).code);
                        }
                    });

                    resolve(Data);
                });
            });
    }

}

module.exports = CssController;