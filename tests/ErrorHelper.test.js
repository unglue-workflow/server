let errorHelper = require('../helper/error-helper');

test('Test 1: Error with string', () => {
    expect(errorHelper('Test')).toEqual({
        message: 'Test',
        stack: null
    });
});

test('Test 2: Error with object', () => {
    expect(errorHelper({
        message: 'Test',
        stack: 'Test stack'
    })).toEqual({
        message: 'Test',
        stack: 'Test stack'
    });
});