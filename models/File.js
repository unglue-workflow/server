
class File {

    constructor(path, relativePath, code) {
        this.path = path;
        this.relativePath = relativePath;
        this.code = code;
    }

    getPath() {
        return this.path;
    }

    getRelativePath() {
        return this.relativePath;
    }

    getCode() {
        return this.code;
    }

}

module.exports = File;