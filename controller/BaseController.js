const fs = require('fs-extra'),
      Concat = require('../lib/Concat'),
      stream = require('stream'),
      Data = require('../models/Data');

class BaseController {

    constructor() {
        this.requiredParams = [];
    }

    prepare(Data, requiredParams) {
        return new Promise((resolve) => {
            Data.checkRequiredParams(requiredParams);
            resolve(Data);
        });
    }

}

module.exports = BaseController;