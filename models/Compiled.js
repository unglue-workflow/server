class Compiled {

    constructor(type) {
        if(!type) {
            throw new Error('Compiled needs a type!');
        }

        this.hasSourcemaps = true;
        if(type == 'svg') {
            this.hasSourcemaps = false;
        }

        this.type = type;
        this.code = "";
        this.map = "";
    }

    getCode(inlineMap = true) {
        return this.code + (this.hasSourcemaps && inlineMap ? this.getSourceMapComment() : '');
    }

    setCode(code) {
        this.code = this.hasSourcemaps  ? this.removeSourceMapComment(code) : code;
        return this;
    }

    getMap() {
        return this.map;
    }

    setMap(map) {
        this.map = map ? map : '';
        return this;
    }

    removeSourceMapComment(code) {
        const regexp = this.type === 'css' ? new RegExp('\\/\\*# sourceMappingURL[^\\*]*\\*\\/', 'g') : new RegExp('\\/\\/# sourceMappingURL.*', 'g');
        return code.replace(regexp, '');
    }

    getSourceMapComment() {
        if(!this.getMap()) {
            return '';
        }

        const startTag = this.type === 'css' ? '/*# ' : '//# ';
        const endTag = this.type === 'css' ? ' */' : '';

        const sourcemap = this.getMap();
        return `${startTag}sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(sourcemap)).toString('base64')}${endTag}`;
    }

}

module.exports = Compiled;