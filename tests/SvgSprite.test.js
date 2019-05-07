let Data = require('../models/Data');
const SvgSpriteController = require('../controller/SvgSpriteController'),
      path = require('path'),
      fs = require('fs-extra'),
      dir = __dirname;

global.appRoot = path.resolve(__dirname + '/..');

const getDataObject = function() {
    return new Data('svg', [], {
        files: [{
                file: "resources/svg/icons/test.svg",
                relative: "../svg/icons/test2.svg",
                code: "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"angle-down\" class=\"svg-inline--fa fa-angle-down fa-w-10\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><path fill=\"currentColor\" d=\"M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z\"></path></svg>"
            },
            {
                file: "resources/svg/icons/test2.svg",
                relative: "../svg/icons/test2.svg",
                code: "<svg aria-hidden=\"true\" data-prefix=\"fas\" data-icon=\"angle-down\" class=\"svg-inline--fa fa-angle-down fa-w-10\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><path fill=\"currentColor\" d=\"M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z\"></path></svg>"
            }
        ]
    });
}

test('Test 1: Default options', done => {
    new SvgSpriteController().compile(getDataObject()).then((Data) => {
        // fs.writeFileSync(`${dir}/data/svg-sprite/test1-expected.svg`, Data.getCompiled().getCode());
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/svg-sprite/test1-expected.svg`).toString());
        done();
    });
});

test('Test 2: Custom Options', done => {
    const Data = getDataObject();
    Data.setOption('svg', {
        cleanDefs: true,
        cleanSymbols: true,
        svgAttrs: {border: '1px solid black'},
        symbolAttrs: {border: '1px solid black'}
    })
    new SvgSpriteController().compile(Data).then((Data) => {
        // fs.writeFileSync(`${dir}/data/svg-sprite/test2-expected.svg`, Data.getCompiled().getCode());
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/svg-sprite/test2-expected.svg`).toString());
        done();
    });
});