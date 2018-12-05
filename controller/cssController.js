const fs = require('fs-extra'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer'),
      crypto = require('crypto');

const compileSass = function(tmpDir, mainFile, options) {
    let result;
    try {
        result = sass.renderSync({
            file: tmpDir + mainFile,
            outputStyle: options.compress ? 'compressed' : 'expanded',
            sourceMap: options.maps,
            sourceMapEmbed: options.maps
        });
    } catch(error) {
        // Remove tmpDir to keep the tmp dir clean
        fs.removeSync(tmpDir);
        throw new Error(error.message);
    }

    return result.css.toString('utf8');
};

const compilePostCss = function(css, options) {
    let result;
    try {
        const postcssPlugins = [postcssAutoprefixer];
        result = postcss(postcssPlugins).process(css, {map: {inline: options.maps}});
    } catch(error) {
        // Remove tmpDir to keep the tmp dir clean
        fs.removeSync(tmpDir);
        throw new Error(error.message);
    }
    return result.css;
};

const writeFiles = function(files, tmpDir) {
    for (let index in files) {
        const file = files[index];
        const filePath = file.file;
        const fileContent = file.content;

        // Get folder path from filepath
        let folderPath = filePath.split('/');
        folderPath.pop();
        folderPath = folderPath.join('/');

        try {
            fs.ensureDirSync(tmpDir + '/' + folderPath);
            fs.writeFileSync(tmpDir + filePath, fileContent);
        } catch(error) {
            throw new Error(error.message);
        }

        console.info("Writing file: " + filePath);
    }

    return true;
}

const compile = function(mainFile, files, res, options) {
    // Generate hash based on mainFile and files
    // Replace hash through identifier sent by client
    const hash = crypto.createHash('sha1').update(mainFile + JSON.stringify(files)).digest("hex");
    const tmpDir = appRoot + '/tmp/scss/' + hash;

    console.info("Temp dir: " + tmpDir);

    // Write files to disk
    writeFiles(files, tmpDir);

    let css;
    css = compileSass(tmpDir, mainFile, options);
    css = compilePostCss(css, options);
    
    // Remove temporary files
    console.info("Removing " + tmpDir);
    fs.removeSync(tmpDir);

    res.json({
        css: css
    });
};

exports.handleRequest = function(req, res, next) {
    if(!req.body.mainFile) {
        res.status(400);
        throw new Error('No mainFile received!');
    }
    if(!req.body.files) {
        res.status(400);
        throw new Error('No files received!');
    }

    const options = {
        compress: true,
        maps: false
    };

    if(req.body.options) {
        for (let key in req.body.options) {
            if(typeof options[key] !== 'undefined') {
                options[key] = req.body.options[key];
            }
        }
    }

    const mainFile = req.body.mainFile,
          files = req.body.files;

    compile(mainFile, files, res, options);
};