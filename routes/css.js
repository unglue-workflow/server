module.exports = (req, res) => {
    let Data = require('../models/Data');
    let ScssController = require('../controller/ScssController');
    let CssController = require('../controller/CssController');

    // Create new Data object
    // This object will hold all our data through the entire compilation process
    // The first param defines the type of the compiled code
    // The second param defines which params have to be set in the req.body
    Data = new Data('css', ['distFile', 'mainFiles'], req.body);

    new ScssController().compile(Data)
        .then((Data) => {
            return new CssController().compile(Data);
        })
        .then(Data => {
            res.json(Data.getResponseObject());
        })
        .catch(error => {
            let githubIssue = 'https://github.com/unglue-workflow/server/issues/new?';
            githubIssue += `title=${encodeURIComponent('Error: ' + error.message)}`;
            if(error.stack) {
                githubIssue += `&body=${encodeURIComponent(error.stack)}`;
            }

            res.status(500);
            res.json({
                message: error.message,
                // Replace base dir in stack to not expose to much information
                stack: error.stack ? error.stack : '',
                githubIssue: githubIssue
            });
        });
};