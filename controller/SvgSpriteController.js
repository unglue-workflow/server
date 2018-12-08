const BaseController = require('./BaseController'),
      svgstore = require('svgstore');

class SvgSpriteController extends BaseController {

    constructor(req, res) {
        super(req, res, ['files']);
    }

    compile() {
        const sprite = svgstore();

        this.data.files.forEach(file => {
            const fileName = file.file.split('/').pop().replace('.svg', '');
            sprite.add(fileName, file.code);
        });
        
        return {
            code: sprite.toString()
        }
    }

}

module.exports = SvgSpriteController;