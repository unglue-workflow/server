class Compiled {

    constructor(type) {
        if(!type) {
            throw new Error('Compiled needs a type!');
        }

        this.hasSourcemaps = type != 'svg';

        this.type = type;
        this.code = "";
        this.map = "";
    }

    getCode(inlineMap = false) {
        return this.code + (this.hasSourcemaps && inlineMap ? this.getSourceMapComment() : '');
    }

    setCode(code) {
        this.code = this.hasSourcemaps  ? this.removeSourceMapComment(code) : code;
        return this;
    }

    getMap() {
        return this.map ? this.map : null
    }

    setMap(map) {
        if(typeof map === 'string') {
            try {
                map = JSON.parse(map);
            } catch (err) {
                map = {};
            }
        }

        this.map = map;
        return this;
    }

    removeSourceMapComment(code) {
        const regexp = this.type === 'css' ? new RegExp('\\/\\*# sourceMappingURL[^\\*]*\\*\\/', 'g') : new RegExp('\\/\\/# sourceMappingURL.*', 'g');
        return code.replace(regexp, '');
    }

    getSourceMapComment() {
        if(!this.getMap() || (typeof this.getMap() === 'object' && Object.keys(this.getMap()).length == 0)) {
            return '';
        }

        const startTag = this.type === 'css' ? '/*# ' : '//# ';
        const endTag = this.type === 'css' ? ' */' : '';

        const sourcemap = this.getMap();
        return `${startTag}sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(sourcemap)).toString('base64')}${endTag}`;
    }

}

module.exports = Compiled;