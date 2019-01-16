const fs = require('fs-extra'),
    sass = require('node-sass'),
    path = require('path');

const BaseController = require('./BaseController');

class ScssController extends BaseController {

    prepare(Data, requiredParams) {
        this.tmpDirStamp = Date.now();
        this.tmpDir = `${appRoot}/tmp/scss/${this.tmpDirStamp}`;
        console.info("CSS Task", `Temp dir: ${this.tmpDir}`);

        return super.prepare(Data, requiredParams);
    }

    writeFiles(Data) {
        return new Promise((resolve, reject) => {
            Data.getFiles().forEach(File => {
                const filePath = File.getPath(),
                    fileCode = File.getCode();

                // Get folder path from filepath
                let folderPath = filePath.split('/');
                folderPath.pop();
                folderPath = this.tmpDir + '/' + folderPath.join('/');
                folderPath = path.normalize(folderPath);

                try {
                    fs.ensureDirSync(folderPath);
                    fs.writeFileSync(path.normalize(this.tmpDir + '/' + filePath), fileCode);
                } catch (error) {
                    reject(error);
                }
            });

            resolve(Data);
        });
    }

    removeFiles() {
        fs.removeSync(this.tmpDir);
    }

    sass(Data) {
        return new Promise((resolve, reject) => {
            // Get all mainFiles and remove the files that aren't scss
            const mainFiles = Data.getParam('mainFiles').filter(value => {
                return path.extname(value) === '.scss';
            });

            // This array will hold all sass compile promises
            const sassPromises = [];

            // Loop through all mainFiles and push a promise into the
            // sassPromises array. These promises will then be chained
            // further down.
            mainFiles.forEach(mainFile => {
                const mainFileTmp = path.normalize(this.tmpDir + mainFile);

                sassPromises.push(Data => {
                    return new Promise((resolve, reject) => {
                        sass.render({
                            file: mainFileTmp,
                            outputStyle: 'expanded',
                            sourceMap: true,
                            outFile: Data.getParam('distFile'),
                            // sourceMapContents: true
                        }, function (error, result) {
                            if (error) {
                                reject(error);
                            } else {
                                Data.addCode(mainFile, result.css.toString())
                                    .addMap(mainFile, result.map ? result.map.toJSON() : '');

                                resolve(Data);
                            }
                        });
                    });
                });
            });

            // Build a promise chain from the promise array
            let promise = sassPromises[0](Data);
            for (let i = 1; i < sassPromises.length; i++) {
                promise = promise.then(Data => sassPromises[i](Data));
            }

            // Resolve or reject the promise based on the results from
            // the promise chain
            promise
                .then(Data => {
                    this.removeFiles();
                    resolve(Data);
                 })
                .catch(error => {
                    reject(error);
                });
        });
    }

    async compile(Data) {
        return this.prepare(Data, ['distFile', 'mainFiles'])
            .then(Data => this.writeFiles(Data))
            .then(Data => this.sass(Data))
            .catch(error => {
                this.removeFiles();
                throw error;
            });
    }

}

module.exports = ScssController;