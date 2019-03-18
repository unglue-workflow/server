const JsController = require('../controller/JsController'),
    path = require('path'),
    fs = require('fs-extra');

global.appRoot = path.resolve(__dirname + '/..');

const fakeReq = {
    body: {
        distFile: 'main.js',
        files: [{
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
    }
};

const fakeRes = {
    json: function () {},
    status: function () {}
}

/*test('Test 1: Compile without compression & maps', () => {
    const controller = new JsController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-test-1.js`).toString());
});

test('Test 2: Compile with compression but without maps', () => {
    fakeReq.body.options.compress = true;

    const controller = new JsController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-test-2.js`).toString());
});

test('Test 3: Compile with compression & maps', () => {
    fakeReq.body.distFile = 'expected-test-3.css';
    fakeReq.body.options.compress = true;
    fakeReq.body.options.maps = true;

    const controller = new JsController(fakeReq, fakeRes);
    const compiled = controller.compile();

    expect(compiled.code).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-test-3.js`).toString());
});

test('Test 4: Compile with css error', () => {
    fakeReq.body.files[0].code = 'const addFive = (x';

    try {
        const controller = new JsController(fakeReq, fakeRes);
        controller.compile();
    } catch (error) {
        expect(error.message).toEqual(fs.readFileSync(`${__dirname}/data/js/expected-error-test-4.js`).toString());
    }
});*/