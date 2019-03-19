class BaseController {

    constructor() {
        this.requiredParams = [];
    }

    prepare(Data, requiredParams, defaultOptions = {}) {

        const requestOptions = Data.getOption(this.name, {});
        Data.setOption(this.name, {
            ...defaultOptions,
            ...requestOptions
        });

        return new Promise((resolve) => {
            Data.checkRequiredParams(requiredParams);
            resolve(Data);
        });
    }

}

module.exports = BaseController;