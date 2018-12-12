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
    
    getSourceMapComment(jsonMap, multiline = true) {
        const startTag = multiline ? '/*# ' : '//# ';
        const endTag = multiline ? ' */' : '';
        for(let i = 0; i < jsonMap.sources.length; i++) {
            jsonMap.sources[i] = jsonMap.sources[i].split(this.tmpDirStamp).pop();
        }
        return `${startTag}sourceMappingURL=data:application/json;base64,${Buffer.from(JSON.stringify(jsonMap)).toString('base64')}${endTag}`;
    }

}

module.exports = BaseController;