const fs = require('fs-extra'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer');

const BaseController = require('./BaseController');

class CssController extends BaseController {

    constructor(req, res) {
        super(req, res, ['distFile', 'mainFile', 'files']);

        this.tmpDir = `${appRoot}/tmp/scss/${Date.now()}`;
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
                sourceMapContents: true
            });
        } catch(error) {
            // Remove tmpDir to keep the tmp dir clean
            this.removeFiles();
            throw new Error("An error occured during the sass render process: " + error.message.replace(this.tmpDir, ''));
        }

        // Remove the tmpDir path from all strings
        if(this.options.maps && result.map) {
            // Remove appRoot from tmpDir because that's the path that node-sass uses
            const tmpDirPathFromAppRoot = this.tmpDir.replace(global.appRoot + '/', '');
            result.map = result.map.toString('utf8');
            result.map = result.map.replace(new RegExp(tmpDirPathFromAppRoot, 'g'), '');
        } else {
            result.map = false;
        }
    
        return {
            code: result.css.toString('utf8'),
            map: result.map
        };
    }

    postCss(css) {
        let result;

        let processOptions = {};
        if(this.options.maps === true) {
            processOptions = {
                from: this.data.mainFile,
                to: this.data.distFile,
                prev: css.map,
                map: { inline: false }
            };
        }
    
        try {
            result = postcss([postcssAutoprefixer]).process(css.code, processOptions);
        } catch(error) {
            // Remove tmpDir to keep the tmp dir clean
            this.removeFiles();
            throw new Error(error.message);
        }
    
        this.removeFiles();

        return {
            code: result.css,
            map: this.options.maps ? result.map.toString() : false
        };
    }

}

module.exports = CssController;
