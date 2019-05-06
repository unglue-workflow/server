let Data = require('../models/Data');
const ScssController = require('../controller/ScssController'),
      CssController = require('../controller/CssController'),
      path = require('path'),
      fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

Data = new Data('css', ['distFile', 'mainFiles'], {
    distFile: 'main.css',
    mainFiles: [
        '/resources/src/scss/main.scss',
        '/resources/src/scss2/main.scss',
    ],
    files: [{
            file: '/resources/src/scss/main.scss',
            relative: '../src/scss/main.scss',
            code: '@import "components/component1"; @import "components/component2";'
        },
        {
            file: '/resources/src/scss/components/_component1.scss',
            relative: '../src/scss/components/_component1.scss',
            code: '.component1 { color: red; background-color: blue; transition: .25s ease-in-out color; }'
        },
        {
            file: '/resources/src/scss/components/_component2.scss',
            relative: '../src/scss/components/_component2.scss',
            code: '.component2 { animation: comp2-anim 2s ease; } @keyframes comp2-anim { 0% {color: red; } to {color: blue; }}'
        },
        {
            file: '/resources/src/scss2/main.scss',
            relative: '../src/scss2/main.scss',
            code: '@import "components/component1"; @import "components/component2";'
        },
        {
            file: '/resources/src/scss2/components/_component1.scss',
            relative: '../src/scss2/components/_component1.scss',
            code: '.component1 { color: red; background-color: blue; transition: .25s ease-in-out color; }'
        },
        {
            file: '/resources/src/scss2/components/_component2.scss',
            relative: '../src/scss2/components/_component2.scss',
            code: '.component2 { animation: comp2-anim 2s ease; } @keyframes comp2-anim { 0% {color: red; } to {color: blue; }}'
        }
    ],
    options: {
        compress: false,
        maps: false
    }
});

test('Test 1: Compile', done => {
    new ScssController().compile(Data).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-1.css`).toString());
        done();
    });
});