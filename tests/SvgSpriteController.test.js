const SvgSpriteController = require('../controller/SvgSpriteController'),
    path = require('path'),
    fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

const fakeReq = {
    body: {
        files: [{
                "file": "resources/svg/icons/test.svg",
                "code": "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"angle-down\" class=\"svg-inline--fa fa-angle-down fa-w-10\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><path fill=\"currentColor\" d=\"M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z\"></path></svg>"
            },
            {
                "file": "resources/svg/icons/test2.svg",
                "code": "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"angle-down\" class=\"svg-inline--fa fa-angle-down fa-w-10\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><path fill=\"currentColor\" d=\"M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z\"></path></svg>"
            }
        ]
    }
};

const fakeRes = {
    json: function () {},
    status: function () {}
}

test('Test 1: Sprite', () => {
    const controller = new SvgSpriteController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/svgSprite/expected-test-1.svg`).toString());
});