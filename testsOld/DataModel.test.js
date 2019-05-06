const BaseData = require('../models/Data');

test('Test 1: Data without files should throw error.', () => {
    try {
        new BaseData('js', [], {});
    } catch (error) {
        expect(error.message).toBe('No files provided!');
    }
});

test('Test 2: Data without requiredParam distFile should throw error.', () => {
    try {
        new BaseData('js', ['distFile'], {
            files: []
        });
    } catch (error) {
        expect(error.message).toBe('Required param "distFile" not provided.');
    }
});

test('Test 2: Data with required distFile shoudl work.', () => {
    try {
        new BaseData('js', ['distFile'], {
            files: [],
            distFile: 'main.js'
        });
    } catch (error) {
        expect(error.message).toBe('Required param "distFile" not provided.');
    }
});

test('Test 3: Concat file code.', () => {
    const Data = new BaseData('js', [], {
        files: [
            {
                "file": "/resources/src/scss/main.scss",
                "relative": "../../src/scss/main.scss",
                "code": ".bla {color: red;}"
            },
            {
                "file": "/resources/src/scss/main2.scss",
                "relative": "../../src/scss/main2.scss",
                "code": ".bla2 {color: blue;}"
            },
        ]
    });

    expect(Data.concatFilesCode()).toMatchObject({"code": ".bla {color: red;}.bla2 {color: blue;}", "hasSourcemaps": true, "map": "", "type": "js"});
});