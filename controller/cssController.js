const fs = require('fs-extra'),
      sass = require('node-sass'),
      postcss = require('postcss'),
      postcssAutoprefixer = require('autoprefixer'),
      crypto = require('crypto');

const compileSass = (distFile, mainFile, tmpDir, options) => {
    let result;
    try {
        result = sass.renderSync({
            file: tmpDir + mainFile,
            outputStyle: options.compress ? 'compressed' : 'expanded',
            sourceMap: options.maps,
            outFile: distFile
        });
    } catch(error) {
        // Remove tmpDir to keep the tmp dir clean
        fs.removeSync(tmpDir);
        throw new Error(error.message);
    }

    return {
        code: result.css.toString('utf8'),
        map: options.maps ? result.map.toString('utf8') : false
    };
};

const compilePostCss = (css, distFile, mainFile, options) => {
    let result;

    let processOptions = {};
    if(options.maps === true) {
        processOptions = {
            from: mainFile,
            to: distFile,
            prev: css.map,
            map: { inline: false }
        };
    }

    try {
        const postcssPlugins = [postcssAutoprefixer];
        result = postcss(postcssPlugins).process(css.code, processOptions);
    } catch(error) {
        // Remove tmpDir to keep the tmp dir clean
        fs.removeSync(tmpDir);
        throw new Error(error.message);
    }

    return {
        code: result.css,
        map: options.maps ? result.map.toString() : false
    };
};

const writeFiles = (files, tmpDir) => {
    files.forEach( function(file) {
        const filePath = file.file;
        const fileCode = file.code;

        // Get folder path from filepath
        let folderPath = filePath.split('/');
        folderPath.pop();
        folderPath = folderPath.join('/');

        try {
            fs.ensureDirSync(tmpDir + '/' + folderPath);
            fs.writeFileSync(tmpDir + filePath, fileCode);
        } catch(error) {
            throw new Error(error.message);
        }

        console.info(`Writing file: ${filePath}`);
    });

    return true;
}

const compile = (distFile, mainFile, files, options) => {
    const tmpDir = `${appRoot}/tmp/scss/${Date.now()}`;
    console.info(`Temp dir: ${tmpDir}`);

    // Write files to disk
    writeFiles(files, tmpDir);

    let css;
    css = compileSass(distFile, mainFile, tmpDir, options);
    css = compilePostCss(css, distFile, mainFile, options);
    
    // Remove temporary files
    console.info(`Removing ${tmpDir}`);
    fs.removeSync(tmpDir);

    return css;
};

exports.compile = compile;

exports.handleRequest = (req, res) => {
    if(!req.body.distFile) {
        res.status(400);
        throw new Error('No distFile received!');
    }
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
        options = { ...options, ...req.body.options };
    }

    const compiledData = compile(req.body.distFile, req.body.mainFile, req.body.files, options);

    res.json(compiledData);
};