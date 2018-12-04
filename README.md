# Server

The node server which processes the request.

## Install

`yarn install`

## Start

`yarn run start`

## Endpoints

`/compile/scss`  
Compiles given scss files to css and runs autoprefixer.

Expects (and requires):

```json
{
    mainFile : '/path/to/main/file/as/it/is/in/files.scss',
    files: {
        '/path/to/file.scss' : 'content-of-file'
    }
}
```