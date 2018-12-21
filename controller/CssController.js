const fs = require('fs-extra'),
    sass = require('node-sass'),
    postcss = require('postcss'),
    path = require('path'),
    postcssAutoprefixer = require('autoprefixer');

const BaseController = require('./BaseController');

class CssController extends BaseController {

    constructor(req, res) {
        super(req, res, ['distFile', 'mainFiles', 'files']);

        this.tmpDirStamp = Date.now();
        this.tmpDir = `${appRoot}/tmp/scss/${this.tmpDirStamp}`;
        console.info("CSS Task", `Temp dir: ${this.tmpDir}`, `Compiling ${this.data.files.length} files.`);
    }

    compile() {
        this.writeFiles();

        let compiledCode = [];
        this.data.mainFiles.forEach(mainFile => {
            if(path.extname(mainFile) === '.scss') {
                code = this.sass(mainFile);
                code.code = this.removeSourceMapComment(code.code);
                code.file = mainFile;
            } else if(path.extname(mainFile) === '.css') {
                const file = this.data.files.filter(file => {
                    return file.file === mainFile;
                });

                if(file.length == 0) {
                    throw new Error(`mainFile ${mainFile} was not found in files array.`);
                }

                code = file[0];
                code.map = {};
            }

            compiledCode.push(code);
        });

        let css = this.concat(compiledCode, this.data.distFile);
        if(this.options.maps && css.map) {
            css.code = css.code + this.generateSourceMapComment(JSON.parse(css.map));
        }

        css = this.postCss(css);

        return css;
    }

    writeFiles() {
        const self = this;
        this.data.files.forEach(function (file) {
            const filePath = file.file;
            const fileCode = file.code;

            // Get folder path from filepath
            let folderPath = filePath.split('/');
            folderPath.pop();
            folderPath = folderPath.join('/');

            try {
                fs.ensureDirSync(self.tmpDir + '/' + folderPath);
                fs.writeFileSync(self.tmpDir + filePath, fileCode);
            } catch (error) {
                throw new Error(error.message);
            }
        });

        return true;
    }

    removeFiles() {
        console.info(`Removing ${this.tmpDir}`);
        fs.removeSync(this.tmpDir);
    }

    sass(mainFile) {
        let result;
        try {
            let tmpDir = this.tmpDir;
            if(mainFile.slice(0, 1) !== '/') {
                tmpDir += '/';
            }

            result = sass.renderSync({
                file: tmpDir + mainFile,
                outputStyle: this.options.compress ? 'compressed' : 'expanded',
                sourceMap: this.options.maps,
                outFile: this.data.distFile,
                sourceMapContents: this.options.maps
            });
        } catch (error) {
            // Remove tmpDir to keep the tmp dir clean
            this.removeFiles();

            let file = false;
            if(error.file) {
                file = this.removeTmpDir(error.file);
                file = this.getRelativePath(file);
            }

            let message = 'SCSS:';
            message += ` ${error.message}${error.line ? ' on line ' + error.line + ':' + (error.column > 1 ? error.column : '') : ''}${file ? ' in ' + file : ''}`;
            throw new Error(message);
        }

        return {
            code: result.css.toString('utf8'),
            map: this.options.maps ? JSON.parse(result.map) : false
        };
    }

    postCss(css) {
        let result;

        let processOptions = {};
        if (this.options.maps) {
            processOptions = {
                map: {
                    inline: false
                },
                to: this.data.distFile
            };
        }

        try {
            result = postcss([postcssAutoprefixer]).process(css.code, processOptions);
        } catch (error) {
            // Remove tmpDir to keep the tmp dir clean
            this.removeFiles();
            throw new Error(error.message);
        }

        let code = result.css;
        if (this.options.maps && result.map) {
            code = this.removeSourceMapComment(code);
            code += this.generateSourceMapComment(result.map.toJSON());
        }

        this.removeFiles();

        return {
            code: code
        };
    }

}

module.exports = CssController;