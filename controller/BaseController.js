const Concat = require('../lib/Concat');

class BaseController {

    constructor(req, res, requiredParams) {
        this.req = req;
        this.res = res;

        this.data = {};
        this.options = {
            compress: true,
            maps: false
        };

        if (req.body.options) {
            this.options = {
                ...this.options,
                ...req.body.options
            };
        }

        requiredParams.forEach(param => {
            this.required(param);
        });
    }

    required(param) {
        if (!this.req.body[param] || this.req.body[param] && this.req.body[param].length <= 0) {
            this.res.status(400);
            throw new Error(`No ${param} received!`);
        }

        this.data[param] = this.req.body[param];
    }

    concat(codeObjects, distFile) {
        const concat = new Concat(this.options.maps, distFile);

        codeObjects.forEach(codeObject => {
            concat.add(codeObject.file, codeObject.code, codeObject.map ? codeObject.map : {});
        });

        return {
            code: concat.content.toString(),
            map: concat.sourceMap
        };
    }

    removeSourceMapComment(code, multiline = true) {
        const regexp = multiline ? new RegExp('\\/\\*# sourceMappingURL[^\\*]*\\*\\/', 'g') : new RegExp('\\/\\/# sourceMappingURL.*', 'g');
        return code.replace(regexp, '');
    }

    generateSourceMapComment(jsonMap, multiline = true) {
        const startTag = multiline ? '/*# ' : '//# ';
        const endTag = multiline ? ' */' : '';

        if(jsonMap.sources) {
            for (let i = 0; i < jsonMap.sources.length; i++) {
                let relativePath = jsonMap.sources[i];
                relativePath = this.removeTmpDir(relativePath);
                relativePath = this.getRelativePath(relativePath);

                jsonMap.sources[i] = relativePath;
            }
        }

        return `${startTag}sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(jsonMap)).toString('base64')}${endTag}`;
    }

    removeTmpDir(path) {
        // Remove tmpDir from path if existing
        if (this.tmpDirStamp) {
            path = path.split(this.tmpDirStamp).pop();
        }
        return path;
    }

    getRelativePath(absolutePath) {
        const pathMapping = {};
        this.data.files.forEach((file) => {
            if (file.relative) {
                pathMapping[file.file] = file.relative;
            }
        });

        if (pathMapping && pathMapping[absolutePath]) {
            return pathMapping[absolutePath];
        }

        return absolutePath;
    }

}

module.exports = BaseController;