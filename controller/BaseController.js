class BaseController {

    constructor(req, res, requiredParams) {
        this.req = req;
        this.res = res;

        this.data = {};
        this.options = {
            compress: true,
            maps: false
        };

        if(req.body.options) {
            this.options = {...this.options, ...req.body.options};
        }

        requiredParams.forEach(param => {
            this.required(param);
        });
    }

    required(param) {
        if(!this.req.body[param] || this.req.body[param] && this.req.body[param].length <= 0 ) {
            this.res.status(400);
            throw new Error(`No ${param} received!`);
        }

        this.data[param] = this.req.body[param];
    }

    removeSourceMapComment(code, multiline = true) {
        const regexp = multiline ? new RegExp('\\/\\*# sourceMappingURL[^\\*]*\\*\\/', 'g') : new RegExp('\\/\\/# sourceMappingURL.*', 'g');
        return code.replace(regexp, '');
    }
    
    getSourceMapComment(jsonMap, multiline = true) {
        const startTag = multiline ? '/*# ' : '//# ';
        const endTag = multiline ? ' */' : '';

        const pathMapping = {};
        this.data.files.forEach((file) => {
            if(file.relative) {
                pathMapping[file.file] = file.relative;
            }
        });

        if(pathMapping) {
            for(let i = 0; i < jsonMap.sources.length; i++) {
                let newPath = jsonMap.sources[i];
                
                // Remove tmpDir from path if existing
                if(this.tmpDirStamp) {
                    newPath = newPath.split(this.tmpDirStamp).pop();
                }

                // Set the relative path as new path
                if(pathMapping[newPath]) {
                    jsonMap.sources[i] = pathMapping[newPath];
                } else {
                    jsonMap.sources[i] = newPath;
                }
            }
        }

        return `${startTag}sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(jsonMap)).toString('base64')}${endTag}`;
    }

}

module.exports = BaseController;