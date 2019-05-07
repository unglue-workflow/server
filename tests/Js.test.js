let Data = require('../models/Data');
const JsController = require('../controller/JsController'),
      path = require('path'),
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

test('Test 1: Default options', done => {
    new JsController().compile(getDataObject()).then((Data) => {
        // fs.writeFileSync(`${dir}/data/js/test1-expected.js`, Data.getCompiled().getCode(true));
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/js/test1-expected.js`).toString());
        done();
    });
});

test('Test 2: compress false', done => {
    const Data = getDataObject();
    Data.setOption('compress', false);
    new JsController().compile(Data).then((Data) => {
        // fs.writeFileSync(`${dir}/data/js/test2-expected.js`, Data.getCompiled().getCode(true));
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/js/test2-expected.js`).toString());
        done();
    });
});

test('Test 3: maps true', done => {
    const Data = getDataObject();
    Data.setOption('maps', true);
    new JsController().compile(Data).then((Data) => {
        // fs.writeFileSync(`${dir}/data/js/test3-expected.js`, Data.getCompiled().getCode(true));
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/js/test3-expected.js`).toString());
        done();
    });
});

test('Test 4: maps true, babel false', done => {
    const Data = getDataObject();
    Data.files = [{
        file: '/resources/src/js/main.js',
        relative: '../src/js/main.js',
        code: 'var test = function(x) {return x + 5;}; test();'
    }];
    Data.setOption('maps', true);
    Data.setOption('js', {babel: false})
    new JsController().compile(Data).then((Data) => {
        // fs.writeFileSync(`${dir}/data/js/test4-expected.js`, Data.getCompiled().getCode(true));
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/js/test4-expected.js`).toString());
        done();
    });
});

test('Test 5: maps true, babel false, uglify false', done => {
    const Data = getDataObject();
    Data.files = [{
        file: '/resources/src/js/main2.js',
        relative: '../src/js/main2.js',
        code: 'var test = function(x) {return x + 5;}; test();'
    }];
    Data.setOption('maps', true);
    Data.setOption('js', {babel: false, uglifyjs: false});
    new JsController().compile(Data).then((Data) => {
        expect(Data.getCompiled().getCode(true)).toEqual(fs.readFileSync(`${dir}/data/js/test5-expected.js`).toString());
        done();
    });
});

test('Test 6: Error', done => {
    const Data = getDataObject();
    Data.files[0].code = '¢æåß∂æ±“#';
    new JsController().compile(Data).catch(e => {
        expect(e).toEqual({
            message: "unknown: Unexpected character \'¢\' (1:0)\n\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 | \u001b[39m¢æåß∂æ±“\u001b[33m#\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   | \u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m",
            stack: 'SyntaxError: unknown: Unexpected character \'¢\' (1:0)\n\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 1 | \u001b[39m¢æåß∂æ±“\u001b[33m#\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m   | \u001b[39m\u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n    at Parser.raise (/node_modules/@babel/parser/lib/index.js:6322:17)\n    at Parser.getTokenFromCode (/node_modules/@babel/parser/lib/index.js:7011:10)\n    at Parser.nextToken (/node_modules/@babel/parser/lib/index.js:6520:12)\n    at Parser.parse (/node_modules/@babel/parser/lib/index.js:11208:10)\n    at parse (/node_modules/@babel/parser/lib/index.js:11245:38)\n    at parser (/node_modules/@babel/core/lib/transformation/normalize-file.js:170:34)\n    at normalizeFile (/node_modules/@babel/core/lib/transformation/normalize-file.js:138:11)\n    at runSync (/node_modules/@babel/core/lib/transformation/index.js:44:43)\n    at runAsync (/node_modules/@babel/core/lib/transformation/index.js:35:14)\n    at process.nextTick (/node_modules/@babel/core/lib/transform.js:34:34)\n    at process._tickCallback (internal/process/next_tick.js:61:11)'
        });
        done();
    });
});