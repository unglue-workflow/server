const cssController = require('../controller/cssController'),
      path = require('path'),
      fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

const testData = {
    distFile: 'main.css',
    mainFile: '/resources/src/scss/main.scss',
    files: [
        {
            file: '/resources/src/scss/main.scss',
            code: '@import "components/component1"; @import "components/component2";'
        },
        {
            file: '/resources/src/scss/components/_component1.scss',
            code: '.component1 { color: red; background-color: blue; transition: .25s ease-in-out color; }'
        },
        {
            file: '/resources/src/scss/components/_component2.scss',
            code: '.component2 { animation: comp2-anim 2s ease; } @keyframes comp2-anim { 0% {color: red; } to {color: blue; }}'
        }
    ],
    options: {
        compress: false,
        maps: false
    }
};

test('Test 1: Compile without compression & maps', () => {
    const compiled = cssController.compile(
        testData.distFile,
        testData.mainFile,
        testData.files,
        testData.options
    );
    
    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-1.css`).toString());
    expect(compiled.map).toBe(false);
});

test('Test 2: Compile with compression but without maps', () => {
    testData.options.compress = true;

    const compiled = cssController.compile(
        testData.distFile,
        testData.mainFile,
        testData.files,
        testData.options
    );
    
    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-2.css`).toString());
    expect(compiled.map).toBe(false);
});

test('Test 3: Compile with compression & maps', () => {    
    testData.distFile = 'expected-test-3.css';
    testData.options.compress = true;
    testData.options.maps = true;

    const compiled = cssController.compile(
        testData.distFile,
        testData.mainFile,
        testData.files,
        testData.options
    );
    
    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-3.css`).toString());
    expect(compiled.map).toEqual(fs.readFileSync(`${__dirname}/data/css/expected-test-3.css.map`).toString());
});