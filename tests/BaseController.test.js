const BaseController = require('../controller/BaseController'),
    path = require('path'),
    fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

const fakeReq = {
    body: {}
};

const fakeRes = {
    json: function () {},
    status: function () {}
}

test('Test 1: Required', () => {
    const controller = new BaseController(fakeReq, fakeRes, []);

    try {
        controller.required('test');
    } catch (error) {
        expect(error.message).toBe('No test received!');
    }
});