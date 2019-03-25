const Compiled = require('./Compiled'),
      File = require('./File'),
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

        this.hasSourcemaps = true;
        if(type === 'svg') {
            this.hasSourcemaps = false;
        }

        this.type = type;
        this.requiredParams = requiredParams;
        this.files = [];
        this.logMessages = [];
        
        // Get files from request body and remove it
        reqBody.files.forEach(file => {

            // Catch files that don't have the required properties
            if(!file.hasOwnProperty('file') || !file.hasOwnProperty('relative') || !file.hasOwnProperty('code')) {
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
        this.files.push(new File(path, relativePath, code));
        return this;
    }

    getOptions() {
        return this.options;
    }

    setOption(key, value) {
        this.options[key] = value;
        return this;
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

    getResponseObject() {
        const compiled = this.getCompiled();

        return {
            code: compiled.getCode(),
            log: this.logMessages
        }
    }

    getCompiled(ensureOrder = false) {
        const concated = this.concatCompiledCode(ensureOrder);

        // Reset compiled object
        this.compiled = {};

        return concated;
    }

    addCode(id, code) {
        this.ensureCompiledIdExists(id);
        this.compiled[id].setCode(code);
        return this;
    }

    addMap(id, map) {
        if(typeof map === 'string') {
            try {
                map = JSON.parse(map);
            } catch (err) {
                console.log(err);
                map = {};
            }
        }

        this.ensureCompiledIdExists(id);
        this.compiled[id].setMap(map);
        return this;
    }

    clearCompiled() {
        this.compiled = {};
        return this;
    }

    ensureCompiledIdExists(id) {
        if (!this.compiled[id])
            this.compiled[id] = new Compiled(this.type);
    }

    concatCompiledCode(ensureOrder = false) {
        // Shortcut if we only have one compiled code
        if(!ensureOrder && Object.keys(this.compiled).length == 1) {
            return this.compiled[Object.keys(this.compiled)[0]];
        }

        const concat = new Concat(this.getOption('maps'), this.getParam('distFile'));

        let compiled = {};
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

        for (const file in compiled) {
            const code = compiled[file].getCode(false);
            const map = this.hasSourcemaps ? compiled[file].getMap() : {};
            concat.add(file, code, map);
        }

        const result = new Compiled(this.type);
        result.setCode(concat.content.toString());

        if(this.hasSourcemaps) {
            result.setMap(concat.sourceMap);
        }

        return result;
    }

    addLogMessage(msg) {
        this.logMessages.push(msg);
    }

}

module.exports = Data;