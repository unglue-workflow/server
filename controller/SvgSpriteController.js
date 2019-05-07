const BaseController = require('./BaseController'),
    svgstore = require('svgstore'),
    errorHelper = require('../helper/error-helper');

class SvgSpriteController extends BaseController {

    constructor() {
        super();
        this.name = 'svg';
    }

    generateSprite(Data) {
        return new Promise((resolve, reject) => {
            const sprite = svgstore();

            Data.getFiles().forEach(file => {
                const fileName = file.getPath().split('/').pop().replace('.svg', '');
                sprite.add(fileName, file.getCode());
            });

            Data.addCode('main', sprite.toString(Data.getOption(this.name, {})));

            resolve(Data);
        });
    }

    async compile(Data) {
        const defaultOptions = {
            cleanDefs: false,
            cleanSymbols: false,
            svgAttrs: false,
            symbolAttrs: false,
            copyAttrs: false,
            renameDefs: false
        };

        return this.prepare(Data, [])
            .then(Data => this.generateSprite(Data))
            .catch(error => {
                throw errorHelper(error);
            });
    }

}

module.exports = SvgSpriteController;