const fs = require('fs-extra'),
      mkdirp = require('mkdirp'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer'),
      crypto = require('crypto');

const compileSass = function(tempDir, mainFile) {
    const result = sass.renderSync({
        file: tempDir + mainFile,
        outputStyle: 'compressed',
        sourceMap: true,
        sourceMapEmbed: true
    });
    return result.css.toString('utf8');
};

const compilePostCss = function(css) {
    const postcssPlugins = [postcssAutoprefixer];
    result = postcss(postcssPlugins).process(css, {map: {inline: true}});

    return result.css;
};

const compile = function(mainFile, files, res) {
    // Generate hash based on mainFile and files
    // Replace hash through identifier sent by client
    const hash = crypto.createHash('sha1').update(mainFile + JSON.stringify(files)).digest("hex");
    const tempDir = appRoot + '/tmp/scss/' + hash;

    console.info("Temp dir: " + tempDir);

    // Write files to disk
    for (let index in files) {
        const file = files[index];
        const filePath = file.file;
        const fileContent = file.content;

        // Get folder path from filepath
        let folderPath = filePath.split('/');
        folderPath.pop();
        folderPath = folderPath.join('/');

        mkdirp.sync(tempDir + '/' + folderPath);
        fs.writeFileSync(tempDir + filePath, fileContent);

        console.info("Writing file: " + filePath);
    }

    let css;
    css = compileSass(tempDir, mainFile);
    css = compilePostCss(css);
    
    fs.removeSync(tempDir);

    res.json(css);
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

    const mainFile = req.body.mainFile;
    let files = req.body.files;

    if(typeof files === 'string') {
        files = JSON.parse(files);
    }

    compile(mainFile, files, res);
};