# Changelog

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 1.1.3 (21. September 2021)

+ Updated all dependencies

## 1.1.2 (10. July 2019)

+ [#6](https://github.com/unglue-workflow/server/issues/6) Add root get & post response with version and time

## 1.1.1 (08. May 2019)

+ Version bump

## 1.1.0 (08. May 2019)

+ Refactoring of Routes / Controller and Model code to work with promises
+ Enabled more options for the given routes (see below)
+ Improved the compiled response with log
+ Improved error messages with stack trace

**New response examples**

200:
```json
{
  "code": ".css{color:red;}",
  "log": [
    "Warning...", "...", "..."
  ]
}
```

500:
```json
{
  "message": "Error while...",
  "stack": "Error in ../bla/.."
}
```

**New options**

The existing global options `compress` and `maps` will still work and have the same effect as before, but now you can also change specific options of one task.

Base options (default values):
```json
{
    "maps": false,
    "compress": true
}
```

CSS specific options (default values):
```json
{
    "css": {
        "autoprefixer": true,
        "cssnano": true
    }
}
```

> Those two css options also accept an object with specific options for that task. To see what options each task accepts you can look here: [Autoprefixer](https://github.com/postcss/autoprefixer#options), [cssnano](https://cssnano.co/guides/optimisations).

JS specific options (default values):
```json
{
    "js": {
        "babel": {},
        "uglifyjs": {}
    }
}
```

> Possible options: [Babel](https://babeljs.io/docs/en/options), [UglifyJS](https://github.com/mishoo/UglifyJS2#api-reference)

Svg-Sprite specific options (default values):
```json
{
    "svg": {
        "cleanDefs": false,
        "cleanSymbols": false,
        "svgAttrs": false,
        "symbolAttrs": false,
        "copyAttrs": false,
        "renameDefs": false
    }
}
```

> See: https://github.com/svgstore/svgstore#options

## 1.0.17 (21. December 2018)

+ First stable release.
