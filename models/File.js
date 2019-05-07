
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

    getCode(stripSourcemap = false) {
        if(stripSourcemap) {
            const regexp = this.type === 'css' ? new RegExp('\\/\\*# sourceMappingURL[^\\*]*\\*\\/', 'g') : new RegExp('\\/\\/# sourceMappingURL.*', 'g');
            return this.code.replace(regexp, '');
        }

        return this.code;
    }

}

module.exports = File;