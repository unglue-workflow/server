# Unglue Server

[![Build Status](https://travis-ci.org/unglue-workflow/server.svg?branch=master)](https://travis-ci.org/unglue-workflow/server)
[![Maintainability](https://api.codeclimate.com/v1/badges/fe996f47a40285c5a9ca/maintainability)](https://codeclimate.com/github/unglue-workflow/server/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/fe996f47a40285c5a9ca/test_coverage)](https://codeclimate.com/github/unglue-workflow/server/test_coverage)

The node server which processes the request.

## Install

### Node package

`yarn add unglue-server`

### GIT

Clone this repository:

`git clone https://github.com/unglue-workflow/server.git unglue-server/`

Install node modules:

`yarn install`

## Start

### Node package

`yarn --cwd node_modules/unglue-server/ run start`

If you want to, you can add following code to your package.json to shorten the command to `yarn start`:

```json
"scripts": {
    "start": "yarn --cwd node_modules/unglue-server/ run start"
}
```

### GIT

`yarn start`

## Endpoints

**`/compile/scss`**

Compiles given scss files to css and runs autoprefixer.  
A sourcemap can be inlined.

**`/compile/js`**

Uglifies given js files and compiles them from ES6 to ES5 if necessary.  
Sourcemaps can't be generated at the moment.

Expects:

```json
{
    "mainFile" : "/path/to/main/file/as/it/is/in/files.scss",
    "files": [
        {
            "file" : "/path/to/file.scss",
            "content" : "content-of-file"
        }
    ]
}
```

> `mainFile` is only required to compile scss, the js task doesn't use it.  
> `files` is always required.
