const babelCore = require('babel-core'),
      uglifyJs = require('uglify-js'),
      Concat = require('../lib/Concat');

const BaseController = require('./BaseController');

class JsController extends BaseController {

    constructor(req, res) {
        super(req, res, ['distFile', 'files']);

        this.browserlist = [
            "> 0.5%",
            "last 2 versions",
            "IE 10"
        ];
    }

    compile() {
        let js = this.concatJs();
        js = this.babel(js);
    
        if(this.options.compress) {
            js = this.uglify(js);
        } else if(this.options.maps) {
            js.code += `\n//# sourceMappingURL=${this.data.distFile}.map`;
            js.map = JSON.stringify(js.map);
        }

        return {
            code: js.code,
            map: this.options.maps ? js.map : false
        };
    }

    concatJs() {
        const concat = new Concat(this.options.maps, this.data.distFile);

        this.data.files.forEach( (file) => {
            concat.add(file.file, file.code);
        });
    
        return {
            code: concat.content.toString(),
            map: concat.sourceMap
        };
    }

    babel(js) {
        let result = babelCore.transform(js.code, {
            minified: false,
            inputSourceMap: this.options.maps ? JSON.parse(js.map) : false,
            sourceMaps: this.options.maps,
            presets: [
                [
                    "env",
                    {
                        targets: {
                            browsers: this.browserlist
                        }
                    }
                ]
            ]
        });
    
        return {
            code: result.code,
            map: this.options.maps ? result.map : false
        };
    }

    uglify(js) {
        let compileOptions = {};
    
        if(this.options.maps) {
            compileOptions = {
                sourceMap: {
                    filename: this.data.distFile,
                    url: `${this.data.distFile}.map`,
                    content: js.map
                }
            };
        }

        return uglifyJs.minify(js.code, compileOptions);
    }

}

module.exports = JsController;
