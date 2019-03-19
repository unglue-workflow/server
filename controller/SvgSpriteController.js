const BaseController = require('./BaseController'),
    svgstore = require('svgstore');

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

            Data.addCode('main', sprite.toString());

            resolve(Data);
        });
    }

    async compile(Data) {
        return this.prepare(Data, [])
            .then(Data => this.generateSprite(Data))
            .catch(error => {
                throw error;
            });
    }

}

module.exports = SvgSpriteController;