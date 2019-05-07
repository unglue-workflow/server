module.exports = error => {
    const newError = {
        message: null,
        stack: null
    };

    if(typeof error === 'string') {
        newError.message = error.replace(new RegExp(`${global.appRoot}`, 'g'), '');
    } else {
        newError.message = error.message.replace(new RegExp(`${global.appRoot}`, 'g'), '');

        if(error.stack) {
            newError.stack = error.stack.replace(new RegExp(`${global.appRoot}`, 'g'), '')
        }
    }

    return newError;
};