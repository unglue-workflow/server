let Data = require('../models/Data');
const path = require('path'),
      fs = require('fs-extra'),
      dir = __dirname;

global.appRoot = path.resolve(dir + '/..');

const getDataObject = function() {
    return new Data('js', ['distFile'], {
        distFile: 'main.js',
        files: [{
                file: '/resources/src/js/addFive.js',
                relative: '../src/js/addFive.js',
                code: 'const addFive = (x) => {return x + 5;};'
            },
            {
                file: '/resources/src/js/addTen.js',
                relative: '../src/js/addTen.js',
                code: 'const addTen = (x) => {return x + 10;};'
            },
            {
                file: '/resources/src/js/main.js',
                relative: '../src/js/main.js',
                code: 'console.log("Hellow world!"); console.log(addFive(5)); console.log(addTen(10));'
            },
        ]
    });
}

test('Test 1: type check', () => {
    try {
        new Data();
    } catch(e) {
        expect(e.message).toBe('Data needs type!');
    }
});

test('Test 2: requiredParams check', () => {
    try {
        new Data('js');
    } catch(e) {
        expect(e.message).toBe('Data needs requiredParams!');
    }
});

test('Test 3: reqBody check', () => {
    try {
        new Data('js', []);
    } catch(e) {
        expect(e.message).toBe('Data needs reqBody!');
    }
});

test('Test 4: reqBody.files check', () => {
    try {
        new Data('js', [], {});
    } catch(e) {
        expect(e.message).toBe('No files provided!');
    }
});

test('Test 5: reqBody.files file check', () => {
    try {
        new Data('js', [], {files: [{}]});
    } catch(e) {
        expect(e.message).toBe('All provided files need the properties file, relative and code.');
    }
});

test('Test 6: required param file check', () => {
    try {
        new Data('js', ['distFile'], {files: []});
    } catch(e) {
        expect(e.message).toBe('Required param "distFile" not provided.');
    }
});

test('Test 7: params', () => {
    const dataObject = new Data('js', ['distFile'], {files: [], distFile: 'main.js'});
    dataObject.setParam('test', 'test');
    expect(dataObject.getParams()).toEqual({
        distFile: 'main.js',
        test: 'test'
    });
});

test('Test 8: options', () => {
    const dataObject = new Data('js', ['distFile'], {files: [], distFile: 'main.js', options: {test: 'test'}});
    expect(dataObject.getOptions()).toEqual({
        compress: true,
        maps: false,
        test: 'test'
    });
});