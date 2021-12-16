<p align="center">
  <img src="docs/s3-lambo.png" alt="s3-lambo"/>
<p>

<p align="center">
  AWS S3 helpers for Node.js, as fast as a Lambo.
<p>

# Table of Contents
- [Presentation](#presentation)
- [Installation](#installation)
- [Technical information](#technical-information)
  - [Node.js](#nodejs)
  - [Tests](#tests)
    - [Linting](#linting)
    - [Unit](#unit)
- [Usage](#usage)
  - [Environment variables](#environment-variables)
  - [Import](#import)
  - [async getObjectContent(params)](#async-getobjectcontentparams)
  - [async getObjectHash(params)](#async-getobjecthashparams)
  - [async listKeys(params\[, opts\])](#async-listkeysparams-opts)
  - [async upload(params\[, options\])](#async-uploadparams-options)
  - [async uploadFile({ path, params\[, options\] })](#async-uploadfile-path-params-options-)
  - [async uploadDirectory({ path, params\[, options, rootKey, ignore\] })](#async-uploaddirectory-path-params-options-rootkey-ignore-)
  - [Errors](#errors)
    - [Object structure](#object-structure)
    - [Codes](#codes)
- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
- [Support](#support)
- [Security](#security)
- [License](#license)

# Presentation

AWS S3 helpers, as fast as a Lambo.

`params` and `options` of each helper are the same as in the [AWS documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html).

`aws-sdk` module will automatically check for `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables, so there is no manipulation of any kind of vulnerable credentials.

Go Fast or Go Home.

# Installation

`npm install s3-lambo`

`npm i -S s3-lambo`

# Technical information

## Node.js

- Language: JavaScript ES6/ES7
- VM: Node.js >= Dubnium (10.22.1)

## Tests

In order to run unit tests, you'll need to set `AWS_BUCKET`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables.

Command to run all tests:

`npm test`

Full example:

```shell
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE" \
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" \
AWS_BUCKET="test-bucket" \
npm test
```

### Linting

ESLint with Airbnb base rules. See  __<a href="https://github.com/airbnb/javascript" target="_blank">Airbnb JavaScript Style Guide</a>__.

`npm run test:lint`

### Unit

Mocha and Chai.

`npm run test:unit`

# Usage

## Environment variables

| name | type | description | default | example |
| :--- | :--- | :---------- | :------ | :------ |
| **AWS_ACCESS_KEY_ID**\* | AWS | Specifies an AWS access key associated with an IAM user or role. | none | `AKIAIOSFODNN7EXAMPLE` |
| **AWS_SECRET_ACCESS_KEY**\* | AWS | Specifies the secret key associated with the access key. This is essentially the "password" for the access key. | none | `wJalrXUtnFEMI/K7MDENG/`<br/>`bPxRfiCYEXAMPLEKEY` |
| **DEBUG** | Debug | Debug mode. See __[bugbug](https://github.com/adrienv1520/bugbug)__. | none | `s3-lambo:*` |

**\*required**

## Import

```javascript
const s3 = require('s3-lambo');

// s3 is an object of functions
const {
  getObjectContent,
  getObjectHash,
  listKeys,
  upload,
  uploadFile,
  uploadDirectory,
} = require('s3-lambo');
```

*s3-lambo* module exports an object of functions. You'll find the complete list of functions below.

- `s3` **<Object\>** with the following functions.

## async getObjectContent(params)
Returns the content of an S3 object.

**Note**:
- based on the S3 object `ContentType` property, the function will return an object if `application/json` is found, a string if it starts with `text/` or a buffer.

<br/>

  - `params` **<Object\>** See [AWS getObject](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property).
  - Returns: **<Promise\>**
    - Resolve: **<Object\>** | **<String\>** | **<Buffer\>**
    - Reject: **<Error\>**
      - `AWS_NO_SUCH_KEY`
      - `AWS_ERROR`

<br/>

**Examples**:
```javascript
// to be run in an async context

// ContentType is application/json
await getObjectContent({
  Key: 'lambo.json',
  Bucket: 'my-bucket',
}); // { aventador: 'V12' }

// ContentType is text/plain
await getObjectContent({
  Key: 'lambo.txt',
  Bucket: 'my-bucket',
}); // "Aventador"

// no ContentType, seen as application/octet-stream by default
await getObjectContent({
  Key: 'lambo.js',
  Bucket: 'my-bucket',
}); // Buffer
```

## async getObjectHash(params)
Returns the md5 hash of the S3 object content.

<br/>

  - `params` **<Object\>** See [AWS getObject](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property).
  - Returns: **<Promise\>**
    - Resolve: **<String\>**
    - Reject: **<Error\>**
      - `AWS_NO_SUCH_KEY`
      - `AWS_ERROR`

<br/>

**Examples**:
```javascript
// to be run in an async context

await getObjectHash({
  Key: 'lambo.json',
  Bucket: 'my-bucket',
}); // "cc49759e9ae4eb66a270bb61b9fb6b32"
```

## async listKeys(params[, opts])
List all keys of an S3 bucket.

<br/>

  - `params` **<Object\>** See [AWS listObjectsV2](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property).
  - `opts` **<Object\>**
    - `ignoreKeys` **<Array\>** Keys to be ignored. *Default*: `[]`
    - `ignoreRegExp` **<RegExp\>** Keys to be ignored. *Default*: `null`
    - `startSlash` **<Boolean\>** Whether keys listed should start with a slash. *Default*: `false`
  - Returns: **<Promise\>**
    - Resolve: **<Array\>** *Default*: `[]`
    - Reject: **<Error\>**
      - `AWS_ERROR`

<br/>

**Examples**:
```javascript
// to be run in an async context

await listKeys({
  Bucket: bucket,
});

// [
//   'index.css',
//   'index.html',
//   'index.js',
//   'package.json',
//   'private/lambo.png',
//   'public/lambo.json',
//   'sw.js',
// ]

await listKeys({
  Bucket: bucket,
},
{
  ignoreKeys: [
    'sw.js',
  ],
  // ignore keys starting with private/ or ending with .json
  ignoreRegExp: /(^private\/)|(\.json$)/,
  startSlash: true,
});

// [
//   '/index.css',
//   '/index.html',
//   '/index.js',
// ]
```

## async upload(params[, options])
Upload content to an S3 bucket at the specified key.

**Note**:
- add S3 object's `Content-Type` metadata based on key's extension, set to `application/octet-stream` by default (see [node-mime-types](https://github.com/adrienv1520/node-mime-types) for more details).

<br/>

  - `params` **<Object\>** See [AWS upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property).
  - `options` **<Object\>** See [AWS upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property). *Default*: `{}`
  - Returns: **<Promise\>**
    - Resolve: **<Boolean\>**
    - Reject: **<Error\>**
      - `AWS_ERROR`

<br/>

**Examples**:
```javascript
// to be run in an async context

await upload({
  Key: 'lambo.txt',
  Bucket: 'my-bucket',
  Body: 'Aventador',
  CacheControl: 86400,
}); // true, Content-Type metadata is automatically set to text/plain
```

## async uploadFile({ path, params[, options] })
Upload a file to an S3 bucket at the specified key using streams.

**Note**:
- add S3 object's `Content-Type` metadata based on file's extension, set to `application/octet-stream` by default (see [node-mime-types](https://github.com/adrienv1520/node-mime-types) for more details).

<br/>

  - `parameters` **<Object\>**
    - `path` **<String\>** Relative or absolute path to a file.
    - `params` **<Object\>** See [AWS upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property).
    - `options` **<Object\>** See [AWS upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property). *Default*: `{}`
  - Returns: **<Promise\>**
    - Resolve: **<Boolean\>**
    - Reject: **<Error\>**
      - `FS_ERROR`
      - `AWS_ERROR`

<br/>

**Examples**:
```javascript
// to be run in an async context

await uploadFile({
  path: '../lambo.png',
  params: {
    Key: 'private/lambo.png',
    Bucket: 'my-bucket',
    Body: buffer,
    CacheControl: 86400,
  },
}); // true, Content-Type set to image/png
```

## async uploadDirectory({ path, params[, options, rootKey, ignore] })
Upload a directory and its subdirectories to an S3 bucket recursively.

**Note**:

- the file's key once uploaded to a S3 bucket will match the path relative to its root directory;
- `rootKey` is the root AWS key to use, by default it is the bucket root, e.g. saying `rootKey` is `public/images` and you want to upload `/Users/you/my-project/pics`, files will be uploaded to `s3://bucket/public/images`, default to `''`;
- add S3 object's `Content-Type` metadata based on file's extension, set to `application/octet-stream` by default (see [node-mime-types](https://github.com/adrienv1520/node-mime-types) for more details);
- without clustering we found uploading a directory of 1254 files was nearly 2 times faster than the native AWS CLI sync method (it's Python underneath, Node.js should be faster, even faster with a Lambo V12);
- improve this by clustering the whole upload, some extra code/controls will be needed (based on files' length, number of files, available cores, etc.).

<br/>

  - `parameters` **<Object\>**
    - `path` **<String\>** Relative or absolute path to a file.
    - `params` **<Object\>** See [AWS upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property).
    - `options` **<Object\>** See [AWS upload](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property). *Default*: `{}`
    - `rootKey` **<String\>** The root AWS key where to upload the directory's files. *Default*: `''`
    - `ignore` **<Array\>** A list of strings to ignore in the key to upload, could be absolute or relative path to the `rootKey`. *Default*: `null`
  - Returns: **<Promise\>**
    - Resolve: **<Boolean\>**
    - Reject: **<Error\>**
      - `FS_ERROR`
      - `AWS_ERROR`

<br/>

**Examples**:
```javascript
// to be run in an async context

// uploading ./dist directory:
// dist/index.html
// dist/error.html
// dist/css/index.css
// dist/js/index.js
// dist/js/sw.js

await uploadDirectory({
  path: './dist',
  params: {
    Bucket: 'my-bucket',
  },
}); // true

// results in the S3 bucket
// index.html
// error.html
// css/index.css
// js/index.js
// js/sw.js

// uploading ../lambo directory:
// lambo/lambo.png
// lambo/logo/lamborghini.png
// lambo/models/aventador.png
// lambo/models/huracan.png
// lambo/models/urus/urus.png
// lambo/models/urus/urus_pearl_capsule.png
// lambo/models/urus/urus_graphite_capsule.png

await uploadDirectory({
  path: '../lambo',
  params: {
    Bucket: 'my-bucket',
    CacheControl: 86400,
  },
  rootKey: 'public/images',
  ignore: ['urus/'],
}); // true

// results in the S3 bucket
// public/images/lambo.png
// public/images/logo/lamborghini.png
// public/images/models/aventador.png
// public/images/models/huracan.png
```

## Errors

### Object structure

Errors emitted by *s3-lambo* inherit the native Error prototype with an additional `code` property and `toString` method.

```javascript
{
  name,
  code,
  message,
  stack,
  toString(),
}
```

### Codes

<table style="text-align: left; vertical-align: center">
  <tr>
    <th style="text-align: center;">name</th>
    <th style="text-align: center;">code</th>
    <th style="text-align: center;">description</th>
    <th style="text-align: center;">module</th>
  </tr>

  <tr>
    <td rowspan="3"><i>AWSError</i></td>
  </tr>

  <tr>
    <td>AWS_NO_SUCH_KEY</td>
    <td>Key in bucket does not exist.</td>
    <td><code>lib/index</code></td>
  </tr>

  <tr>
    <td>AWS_ERROR</td>
    <td><code>aws-sdk</code> module encountered an error.</td>
    <td><code>lib/index</code></td>
  </tr>

  <tr>
    <td rowspan="2"><i>FSError</i></td>
  </tr>

  <tr>
    <td>FS_ERROR</td>
    <td>An error related to the file system was caught.</td>
    <td><code>lib/index</code></td>
  </tr>

  <tr>
    <td rowspan="2"><i>LibError</i></td>
  </tr>

  <tr>
    <td>UNKNOWN_ERROR</td>
    <td>An unknown error was caugth.</td>
    <td><code>lib/index</code></td>
  </tr>

</table>

# Code of Conduct
This project has a [Code of Conduct](.github/CODE_OF_CONDUCT.md). By interacting with this repository, organization, or community you agree to abide by its terms.

# Contributing

Please take also a moment to read our [Contributing Guidelines](.github/CONTRIBUTING.md) if you haven't yet done so.

# Support
Please see our [Support](.github/SUPPORT.md) page if you have any questions or for any help needed.

# Security
For any security concerns or issues, please visit our [Security Policy](.github/SECURITY.md) page.

# License
[MIT](LICENSE.md).
