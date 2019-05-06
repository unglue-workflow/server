let Data = require('../models/Data');
const ScssController = require('../controller/ScssController'),
      CssController = require('../controller/CssController'),
      path = require('path'),
      fs = require('fs-extra'),
      dir = __dirname;

global.appRoot = path.resolve(__dirname + '/..');

const getDataObject = function() {
    return new Data('css', ['distFile', 'mainFiles'], {
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
                code: '.component1 { color: red; background-color: blue; transition: .25s ease-in-out color; } @media (min-width: 720px) {.red { color: red; }}'
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
                code: '.component1 { color: red; background-color: blue; transition: .25s ease-in-out color; }  @media (min-width: 740px) {.red { color: red; }}'
            },
            {
                file: '/resources/src/scss2/components/_component2.scss',
                relative: '../src/scss2/components/_component2.scss',
                code: '.component2 { animation: comp2-anim 2s ease; } @keyframes comp2-anim { 0% {color: red; } to {color: blue; }}  @media (min-width: 720px) {.blue { color: blue; }}'
            }
        ]
    });
}

test('Test 1: Default options', done => {
    new ScssController().compile(getDataObject()).then((Data) => {
        return new CssController().compile(Data);
    }).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/css/test1-expected.css`).toString());
        done();
    });
});

test('Test 2: compress: false', done => {
    const Data = getDataObject();
    Data.setOption('compress', false);
    new ScssController().compile(Data).then((Data) => {
        return new CssController().compile(Data);
    }).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/css/test2-expected.css`).toString());
        done();
    });
});

test('Test 3: maps true', done => {
    const Data = getDataObject();
    Data.setOption('maps', true);
    new ScssController().compile(Data).then((Data) => {
        return new CssController().compile(Data);
    }).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/css/test3-expected.css`).toString());
        done();
    });
});

test('Test 4: maps true, cssmqpacker true', done => {
    const Data = getDataObject();
    Data.setOption('maps', true);
    Data.setOption('css', {'cssmqpacker': true});
    new ScssController().compile(Data).then((Data) => {
        return new CssController().compile(Data);
    }).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/css/test4-expected.css`).toString());
        done();
    });
});

test('Test 5: maps true, autoprefixer false', done => {
    const Data = getDataObject();
    Data.setOption('maps', true);
    Data.setOption('css', {'autoprefixer': false});
    new ScssController().compile(Data).then((Data) => {
        return new CssController().compile(Data);
    }).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/css/test5-expected.css`).toString());
        done();
    });
});

test('Test 6: cssnano false', done => {
    const Data = getDataObject();
    Data.setOption('css', {'cssnano': false});
    new ScssController().compile(Data).then((Data) => {
        return new CssController().compile(Data);
    }).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/css/test6-expected.css`).toString());
        done();
    });
});

test('Test 7: SCSS Error', done => {
    const Data = getDataObject();
    Data.files[0].code = '.red {≠.c {}}}';

    new ScssController().compile(Data).catch(e => {
        expect(e).toEqual({
            message: 'SCSS: Invalid CSS after ".red {≠.c {}}": expected selector or at-rule, was "}" on line 1:14 in /resources/src/scss/main.scss',
            stack: null
        });
        done();
    });
});

test('Test 8: SCSS @warn', done => {
    const Data = getDataObject();
    Data.files[0].code = '@warn "Test"; @warn "Test #2";';

    new ScssController().compile(Data).then(Data => {
        expect(Data.getResponseObject().log).toEqual(["Warning: Test (main File:/resources/src/scss/main.scss)", "Warning: Test #2 (main File:/resources/src/scss/main.scss)"]);
        done();
    });
});

test('Test 9: SCSS @debug', done => {
    const Data = getDataObject();
    Data.files[0].code = '@debug "Test"; @debug "Test #2";';

    new ScssController().compile(Data).then(Data => {
        expect(Data.getResponseObject().log).toEqual(["Debug: Test (main File:/resources/src/scss/main.scss)", "Debug: Test #2 (main File:/resources/src/scss/main.scss)"]);
        done();
    });
});