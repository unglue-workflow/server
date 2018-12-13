const fs = require('fs-extra'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer');

const BaseController = require('./BaseController');

class CssController extends BaseController {

    constructor(req, res) {
        super(req, res, ['distFile', 'mainFile', 'files']);

        this.tmpDirStamp = Date.now();
        this.tmpDir = `${appRoot}/tmp/scss/${this.tmpDirStamp}`;
        console.info("CSS Task", `Temp dir: ${this.tmpDir}`, `Compiling ${this.data.files.length} files.`);
    }

    compile() {
        this.writeFiles();
        let css = this.sass();
        css = this.postCss(css);

        return css;
    }

    writeFiles() {
        const self = this;
        this.data.files.forEach( function(file) {
            const filePath = file.file;
            const fileCode = file.code;
    
            // Get folder path from filepath
            let folderPath = filePath.split('/');
            folderPath.pop();
            folderPath = folderPath.join('/');

            try {
                fs.ensureDirSync(self.tmpDir + '/' + folderPath);
                fs.writeFileSync(self.tmpDir + filePath, fileCode);
            } catch(error) {
                throw new Error(error.message);
            }
        });
    
        return true;
    }

    removeFiles() {
        console.info(`Removing ${this.tmpDir}`);
        fs.removeSync(this.tmpDir);
    }

    sass() {
        let result;
        try {
            result = sass.renderSync({
                file: this.tmpDir + this.data.mainFile,
                outputStyle: this.options.compress ? 'compressed' : 'expanded',
                sourceMap: this.options.maps,
                outFile: this.data.distFile,
                sourceMapContents: this.options.maps,
                sourceMapEmbed: this.options.maps
            });
        } catch(error) {
            // Remove tmpDir to keep the tmp dir clean
            this.removeFiles();
            throw new Error("An error occured during the sass render process: " + error.message.replace(this.tmpDir, ''));
        }

        let code = result.css.toString('utf8');
        if(this.options.maps && result.map) {
            code = this.removeSourceMapComment(code);
            code += this.getSourceMapComment(JSON.parse(result.map));
        }
    
        return {
            code: code
        };
    }

    postCss(css) {
        let result;

        let processOptions = {};
        if(this.options.maps) {
            processOptions = {
                map: { inline: false },
                to: this.data.distFile
            };
        }
    
        try {
            result = postcss([postcssAutoprefixer]).process(css.code, processOptions);
        } catch(error) {
            // Remove tmpDir to keep the tmp dir clean
            this.removeFiles();
            throw new Error(error.message);
        }

        let code = result.css;
        if(this.options.maps && result.map) {
            code = this.removeSourceMapComment(code);
            code += this.getSourceMapComment(result.map.toJSON());
        }
    
        this.removeFiles();

        return {
            code: code
        };
    }

}

module.exports = CssController;
