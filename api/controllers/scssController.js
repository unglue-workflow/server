'use strict';

const fs = require('fs-extra'),
      mkdirp = require('mkdirp'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer'),
      crypto = require('crypto');

exports.compile = function(req, res) {
    const mainFile = req.body.mainFile,
          options = req.body.options;

    let files = req.body.files;

    if(!mainFile || !files) {
        res.json({'success': false, 'message': 'Files or mainFile argument is missing.'});
        return false;
    }

    if(typeof files === 'string') {
        files = JSON.parse(files);
    }

    // Generate hash based on mainFile and files
    const hash = crypto.createHash('sha1').update(mainFile + JSON.stringify(files)).digest("hex");
    const tempDir = appRoot + '/tmp/scss/' + hash;

    console.info("Temp dir: " + tempDir);

    // Write files to disk
    for(let filePath in files) {
        const fileContent = files[filePath];

        // Get folder path from filepath
        let folderPath = filePath.split('/');
        folderPath.pop();
        folderPath = folderPath.join('/');

        mkdirp.sync(tempDir + '/' + folderPath);
        fs.writeFileSync(tempDir + filePath, fileContent);

        console.info("Writing file: " + filePath);
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