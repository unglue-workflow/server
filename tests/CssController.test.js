const CssController = require('../controller/CssController'),
    path = require('path'),
    fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

const getFakeReq = () => {
    return {
        body: {
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
        }
    };
};

const getFakeRes = () => {
    return {
        json: function () {},
        status: function () {}
    };
}

test('Test 1: Compile without compression & maps', () => {
    const fakeReq = getFakeReq(),
        fakeRes = getFakeRes();

    const controller = new CssController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-1.css`).toString());
});

test('Test 2: Compile with compression but without maps', () => {
    const fakeReq = getFakeReq(),
        fakeRes = getFakeRes();

    fakeReq.body.options.compress = true;

    const controller = new CssController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-2.css`).toString());
});

test('Test 3: Compile with compression & maps', () => {
    const fakeReq = getFakeReq(),
        fakeRes = getFakeRes();

    fakeReq.body.distFile = 'expected-test-3.css';
    fakeReq.body.options.compress = true;
    fakeReq.body.options.maps = true;

    const controller = new CssController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-3.css`).toString());
});

test('Test 4: Compile with css error', () => {
    const fakeReq = getFakeReq(),
        fakeRes = getFakeRes();

    fakeReq.body.files[0].code = '.component1 {}}';

    try {
        const controller = new CssController(fakeReq, fakeRes);
        controller.compile();
    } catch (error) {
        expect(error.message).toEqual('SCSS: Invalid CSS after ".component1 {}": expected selector or at-rule, was "}" on line 1:14 in ../src/scss/main.scss');
    }
});

test('Test 5: Compile with dir error', () => {
    const fakeReq = getFakeReq(),
        fakeRes = getFakeRes();

    fakeReq.body.files[0].file = '..../..]]\$as';

    try {
        const controller = new CssController(fakeReq, fakeRes);
        controller.compile();
    } catch (error) {
        expect(error.message).toMatch(new RegExp('ENOENT: no such file or directory, open .*'));
    }
});

test('Test 6: Compile with mainFile not found', () => {
    const fakeReq = getFakeReq(),
        fakeRes = getFakeRes();

    fakeReq.body.mainFile = 'not-existing.scss';

    try {
        const controller = new CssController(fakeReq, fakeRes);
        controller.compile();
    } catch (error) {
        expect(error.message).toMatch(new RegExp('SCSS: File to read not found or unreadable: .*'));
    }
});