'use strict';

const fs = require('fs-extra'),
      mkdirp = require('mkdirp'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer');

exports.compile = function(req, res) {
    const tempDir = appRoot + '/tmp/scss',
          mainFile = req.body.mainFile,
          options = req.body.options;

    let files = req.body.files

    if(!mainFile || !files) {
        res.json({'success': false, 'message': 'Files or mainFile argument is missing.'});
        return false;
    }

    // Write files to disk
    for(let filePath in files) {
        const fileContent = files[filePath];
        
        // Get folder path from filepath
        let folderPath = filePath.split('/');
        folderPath.pop();
        folderPath = folderPath.join('/');

        mkdirp.sync(tempDir + '/' + folderPath);
        fs.writeFileSync(tempDir + filePath, fileContent);
    }

    // Start compile
    let result = sass.renderSync({
        file: tempDir + mainFile,
        outputStyle: 'compressed',
        sourceMap: true
    });

    const postcssPlugins = [postcssAutoprefixer];
    result = postcss(postcssPlugins).process(result.css.toString('utf8'));
    const css = result.css;
    const map = result.map;

    fs.removeSync(tempDir);

    res.json({
        'success': true,
        'css': css,
        'map': map
    });
};