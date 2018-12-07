const jsController = require('../controller/jsController'),
      path = require('path'),
      fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

const testData = {
    distFile: 'main.js',
    files: [
        {
            file: '/resources/src/js/addFive.js',
            code: 'const addFive = (x) => {return x + 5;};'
        },
        {
            file: '/resources/src/js/addTen.js',
            code: 'const addTen = (x) => {return x + 10;};'
        },
        {
            file: '/resources/src/js/main.js',
            code: 'console.log("Hellow world!"); console.log(addFive(5)); console.log(addTen(10));'
        },
    ],
    options: {
        compress: false,
        maps: false
    }
};

test('Test 1: Compile without compression & maps', () => {
    const compiled = jsController.compile(
        testData.distFile,
        testData.files,
        testData.options
    );
    
    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-test-1.js`).toString());
    expect(compiled.map).toBe(false);
});

test('Test 2: Compile with compression but without maps', () => {
    testData.options.compress = true;

    const compiled = jsController.compile(
        testData.distFile,
        testData.files,
        testData.options
    );
    
    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-test-2.js`).toString());
    expect(compiled.map).toBe(false);
});

test('Test 3: Compile with compression & maps', () => {    
    testData.distFile = 'expected-test-3.css';
    testData.options.compress = true;
    testData.options.maps = true;

    const compiled = jsController.compile(
        testData.distFile,
        testData.files,
        testData.options
    );
    
    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-test-3.js`).toString());
    expect(typeof compiled.map).toBe("string");
});