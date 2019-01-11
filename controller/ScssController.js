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
            Data.getFiles().forEach(file => {
                const filePath = file.path,
                    fileCode = file.code;

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
            const mainFiles = Data.getParam('mainFiles');
            const sassPromises = [];

            mainFiles.forEach(mainFile => {
                if(path.extname(mainFile) === '.scss') {
                    const mainFileTmp = path.normalize(this.tmpDir + mainFile);

                    sassPromises.push(Data => {
                        return new Promise((resolve, reject) => {
                            sass.render({
                                file: mainFileTmp
                            }, function (error, result) {
                                if (error) {
                                    reject(error);
                                } else {
                                    Data.addCode(mainFile, result.css.toString())
                                        .addMap(mainFile, result.map ? result.map : '');

                                    resolve(Data);
                                }
                            });
                        });
                    });
                }
            });

            let promise = sassPromises[0](Data);
            for (let i = 1; i < sassPromises.length; i++) {
                promise = promise.then(Data => sassPromises[i](Data));
            }

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