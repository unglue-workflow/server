module.exports = function(app) {
    var scssController = require('../controllers/scssController');
  
    app.route('/compile/scss')
        .post(scssController.compile);
};