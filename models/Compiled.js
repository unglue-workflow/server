
class Compiled {

    constructor(type) {
        if(!type) {
            throw new Error('Compiled needs a type!');
        }

        this.type = type;
        this.code = "";
        this.map = "";
    }

    getCode(inlineMap = true) {
        return this.code + (inlineMap ? this.getSourceMapComment() : '');
    }

    setCode(code) {
        this.code = this.removeSourceMapComment(code);
        return this;
    }

    getMap() {
        return this.map;
    }

    setMap(map) {
        this.map = map;
        return this;
    }

    removeSourceMapComment(code) {
        const regexp = this.type === 'css' ? new RegExp('\\/\\*# sourceMappingURL[^\\*]*\\*\\/', 'g') : new RegExp('\\/\\/# sourceMappingURL.*', 'g');
        return code.replace(regexp, '');
    }

    getSourceMapComment() {
        const startTag = this.type === 'css' ? '/*# ' : '//# ';
        const endTag = this.type === 'css' ? ' */' : '';

        const sourcemap = this.getMap();
        /*if(sourcemap.sources) {
            for (let i = 0; i < sourcemap.length; i++) {
                // let relativePath = sourcemap[i];
                // relativePath = this.removeTmpDir(relativePath);
                // relativePath = this.getRelativePath(relativePath);

                jsonMap.sources[i] = relativePath;
            }
        }*/

        return `${startTag}sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(sourcemap)).toString('base64')}${endTag}`;
    }

}

module.exports = Compiled;