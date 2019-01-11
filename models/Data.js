const Compiled = require('./Compiled'),
      Concat = require('../lib/Concat');

class Data {

    constructor(type, requiredParams, reqBody) {
        if(!type) {
            throw new Error('Data needs type!');
        }
        if(!requiredParams) {
            throw new Error('Data needs requiredParams!');
        }
        if(!reqBody) {
            throw new Error('Data needs reqBody!');
        }
        if(!reqBody.files) {
            throw new Error('No files provided!');
        }

        this.type = type;
        this.requiredParams = requiredParams;
        this.files = [];
        
        // Get files from request body and remove it
        reqBody.files.forEach(file => {

            // Catch files that don't have the required properties
            if(!file.file || !file.relative || !file.code) {
                throw new Error('All provided files need the properties file, relative and code.');
            }

            this.addFile(file.file, file.relative, file.code);
        });
        delete reqBody.files;
        
        this.params = reqBody;
        this.compiled = {};

        this.options = {...{
            maps: false,
            compress: true
        }, ...this.params.options};
        delete this.params.options;

        this.checkRequiredParams(this.requiredParams);
    }

    checkRequiredParams(requiredParams) {
        requiredParams.forEach(requiredParam => {
            if(!this.getParam(requiredParam, false)) {
                throw new Error(`Required param "${requiredParam}" not provided.`);
            }
        });

        return requiredParams;
    }

    getFiles() {
        return this.files;
    }

    getFile(filePath) {
        const file = this.files.filter(file => file.path === filePath);
        return file ? file[0] : false;
    }

    removeFile(file) {
        delete this.files[file];
        return this;
    }

    addFile(path, relativePath, code) {
        this.files.push({
            path: path,
            relativePath: relativePath,
            code: code
        });
    }

    getOptions() {
        return this.options;
    }

    getOption(key, fallback = false) {
        return this.options.hasOwnProperty(key) ? this.options[key] : fallback;
    }

    getParams() {
        return this.params;
    }

    getParam(key, fallback = false) {
        return this.params.hasOwnProperty(key) ? this.params[key] : fallback;
    }

    setParam(key, value) {
        return this.params[key] = value;
    }

    getCompiled() {
        return this.compiled;
    }

    getCompiledCode(ensureOrder = false) {
        return this.concatCode(ensureOrder).getCode();
    }

    getCompiledMap(ensureOrder = false) {
        return this.concatCode(ensureOrder).getMap();
    }

    addCode(id, code) {
        this.ensureCompiledIdExists(id);
        this.compiled[id].setCode(code);
        return this;
    }

    addMap(id, map) {
        this.ensureCompiledIdExists(id);
        this.compiled[id].setMap(map);
        return this;
    }

    ensureCompiledIdExists(id) {
        if (!this.compiled[id])
            this.compiled[id] = new Compiled(this.type);
    }

    concatCode(ensureOrder = false) {
        if(!this.result) {
            const concat = new Concat(this.getOption('maps'), this.getParam('distFile'));

            console.log("THIS.COMPILED", ensureOrder);
            for(const file in this.compiled) {
                console.log(file);
            }

            const compiled = {};
            if(ensureOrder) {
                if(!this.getParam('mainFiles')) {
                    throw new Error('The param mainFiles is required for Data.ensureOrder to work.');
                }

                this.getParam('mainFiles').forEach(mainFile => {
                    if(!this.compiled[mainFile]) {
                        throw new Error(`${mainFile} couldn't be found in Data.compiled.`);
                    }
                    
                    compiled[mainFile] = this.compiled[mainFile];
                });
            } else {
                compiled = this.compiled;
            }

            console.log("COMPILED");
            for(const file in compiled) {
                console.log(file);
            }

            for (const file in compiled) {
                const code = compiled[file].getCode();
                const map = compiled[file].getMap();
                concat.add(file, code, map ? map : {});
            }

            this.result = new Compiled(this.type);
            this.result.setCode(concat.content.toString());
            this.result.setMap(concat.sourceMap);
        }

        return this.result;
    }

}

module.exports = Data;