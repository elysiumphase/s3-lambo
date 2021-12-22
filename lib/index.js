/**
 * s3-lambo
 *
 * AWS S3 helpers for Node.js, as fast as a Lambo.
 *
 * params and options are the same as in the AWS documentation:
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
 *
 * aws-sdk will automatically check for AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
 * environment variables, so there is no manipulation of any kind of vulnerable credentials.
 *
 * Author: ThousandX <hi@thousand.xyz> (https://github.com/thousandxyz)
 *
 * - async getObjectContent(params) -> Object|String|Buffer Throws Error
 * - async getObjectHash(params) -> String Throws Error
 * - async listKeys(params, { ignoreKeys, ignoreRegExp, startSlash } = {}) -> Array Throws Error
 * - async uploadFile({ path, params, options } = {}) -> Boolean Throws Error
 * - async upload({ params, options } = {}) -> Boolean Throws Error
 * - async uploadDirectory({ path, params, options, rootKey, ignore } = {}) -> Boolean Throws Error
 */
const { createHash } = require('crypto');
const { createReadStream, promises: { readdir, stat: getStats } } = require('fs');
const { posix, resolve } = require('path');
const S3 = require('aws-sdk/clients/s3');
const { getMIMEType } = require('node-mime-types');
const debug = require('bugbug')('s3-lambo', 'red');
const { object: { exists, is, clone } } = require('consis');
const LibError = require('./LibError');

const s3 = new S3({
  signatureVersion: 'v4',
});

/**
 * @func getObjectContent
 *
 * Returns the content of an S3 object.
 *
 * @param  {params} params
 * @return {Object|String|Buffer}
 * @throws {Error}
 */
const getObjectContent = async function getObjectContent(params) {
  const parameters = clone(params) || {};
  let content;

  try {
    const object = await s3.getObject(parameters).promise();

    debug(`got ${parameters.Key} (${object.ContentType}) in bucket ${parameters.Bucket}`);

    if (exists(object.Body) && is(String, object.ContentType)) {
      if (object.ContentType === 'application/json') {
        content = JSON.parse(object.Body.toString('utf8'));
      } else if (object.ContentType.startsWith('text')) {
        content = object.Body.toString('utf8');
      } else {
        content = object.Body;
      }
    }
  } catch (e) {
    const errorParams = e.code === 'NoSuchKey'
      ? LibError.Codes.AWS_NO_SUCH_KEY
      : LibError.Codes.AWS_ERROR;
    const error = new LibError(errorParams, e);
    error.setMessage(`unable to get object ${parameters.Key}, ${e.message}`);
    debug(error.toString());
    throw error;
  }

  return content;
};

/**
 * @func getObjectHash
 *
 * Returns the md5 hash of the S3 object content.
 *
 * @param  {params} params
 * @return {String}
 * @throws {Error}
 */
const getObjectHash = async function getObjectHash(params) {
  const parameters = clone(params) || {};
  let hash;

  try {
    const object = await s3.getObject(parameters).promise();
    // will throw as expected if Body has no content
    hash = createHash('md5').update(object.Body).digest('hex');

    debug(`generated ${parameters.Key} hash from bucket ${parameters.Bucket}`);
  } catch (e) {
    const errorParams = e.code === 'NoSuchKey'
      ? LibError.Codes.AWS_NO_SUCH_KEY
      : LibError.Codes.AWS_ERROR;
    const error = new LibError(errorParams, e);
    error.setMessage(`unable to generate object ${parameters.Key} hash from bucket ${parameters.Bucket}, ${e.message}`);
    debug(error.toString());
    throw error;
  }

  return hash;
};

/**
 * @func listKeys
 *
 * List all keys of an S3 bucket.
 *
 * @param  {params} params
 * @param  {Array} ignoreKeys
 * @param  {RegExp} ignoreRegExp
 * @param  {Boolean} startSlash
 * @return {Array}
 * @throws {Error}
 */
const listKeys = async function listKeys(params, { ignoreKeys, ignoreRegExp, startSlash } = {}) {
  const parameters = clone(params) || {};
  const keys = [];
  const ignoreArrayKeys = is(Array, ignoreKeys) ? clone(ignoreKeys) : [];
  const ignoreReg = is(RegExp, ignoreRegExp) ? ignoreRegExp : null;
  const slash = startSlash === true;

  try {
    const { Contents: contents } = await s3.listObjectsV2(parameters).promise();

    debug(`got objects list in bucket ${parameters.Bucket}`);

    if (is(Array, contents)) {
      contents.forEach((content) => {
        if (is(String, content.Key)
          && !ignoreArrayKeys.includes(content.Key)
          && (!exists(ignoreReg) || !ignoreReg.test(content.Key))) {
          keys.push(slash ? `/${content.Key}` : content.Key);
        }
      });
    }
  } catch (e) {
    const error = new LibError(LibError.Codes.AWS_ERROR, e);
    error.setMessage(`unable to list objects in bucket ${parameters.Bucket}, ${e.message}`);
    debug(error.toString());
    throw error;
  }

  return keys;
};

/**
 * @func upload
 *
 * Upload content to an S3 bucket at the specified key.
 *
 * Note:
 * - add S3 object's `Content-Type` metadata based on key's extension,
 *   set to `application/octet-stream` by default
 *   (see [node-mime-types](https://github.com/adrienv1520/node-mime-types) for more details).
 *
 * @param  {Object} params
 * @param  {Object} options
 * @return {Boolean}
 * @throws {Error}
 */
const upload = async function upload(params, options) {
  const parameters = clone(params) || {};
  const opts = clone(options) || {};

  try {
    parameters.ContentType = getMIMEType(parameters.Key);
    await s3.upload(parameters, opts).promise();

    debug(`${parameters.Key} (${parameters.ContentType}) uploaded in bucket ${parameters.Bucket}`);
  } catch (e) {
    const error = new LibError(LibError.Codes.AWS_ERROR, e);
    error.setMessage(`unable to upload content, check params and options, ${e.message}`);
    debug(error.toString());
    throw error;
  }

  return true;
};

/**
 * @func uploadFile
 *
 * Upload a file to an S3 bucket at the specified key using streams.
 *
 * Note:
 * - add S3 object's `Content-Type` metadata based on file's extension,
 *   set to `application/octet-stream` by default
 *   (see [node-mime-types](https://github.com/adrienv1520/node-mime-types) for more details).
 *
 * @param  {String} path
 * @param  {Object} params
 * @param  {Object} options
 * @return {Boolean}
 * @throws {Error}
 */
const uploadFile = async function uploadFile({ path, params, options } = {}) {
  const parameters = clone(params) || {};
  const opts = clone(options) || {};

  try {
    const rstream = createReadStream(resolve(path));

    rstream.once('error', (err) => {
      const error = new LibError(LibError.Codes.FS_ERROR, err);
      error.setMessage(`unable to upload file ${path}, ${err.message}`);
      debug(error.toString());
    });

    parameters.Body = rstream;
    parameters.ContentType = getMIMEType(path);
    await s3.upload(parameters, opts).promise();

    debug(`${parameters.Key} (${parameters.ContentType}) uploaded in bucket ${parameters.Bucket}`);
  } catch (e) {
    const error = new LibError(LibError.Codes.AWS_ERROR, e);
    error.setMessage(`unable to upload file ${path} at ${parameters.Key} in bucket ${parameters.Bucket}, ${e.message}`);
    debug(error.toString());
    throw error;
  }

  return true;
};

/**
 * @func uploadDirectory
 *
 * Upload a directory and its subdirectories to an S3 bucket recursively.
 *
 * Note:
 * - the file's key once uploaded to a S3 bucket will match the path relative to
 *   its root directory;
 * - `rootKey` is the root AWS key to use, by default it is the bucket root, e.g.
 *   saying `rootKey` is `public/images` and you want to upload `/Users/you/my-project/pics`,
 *   files will be uploaded to `s3://bucket/public/images`, default to `''`;
 * - add S3 object's `Content-Type` metadata based on file's extension,
 *   set to `application/octet-stream` by default
 *   (see [node-mime-types](https://github.com/adrienv1520/node-mime-types) for more details);
 * - without clustering we found uploading a directory of 1254 files was nearly
 *   2 times faster than the native AWS CLI sync method (it's Python underneath,
 *   Node.js should be faster, even faster with a Lambo V12);
 * - improve this by clustering the whole upload, some extra code/controls will
 *   be needed (based on files' length, number of files, available cores, etc.).
 *
 * @param  {String} path
 * @param  {Object} params
 * @param  {Object} options
 * @param  {String} rootKey
 * @param  {Array}  ignore
 * @return {Boolean}
 * @throws {Error}
 */
const uploadDirectory = async function uploadDirectory({
  path,
  params,
  options,
  rootKey,
  ignore,
} = {}) {
  const parameters = clone(params) || {};
  const opts = clone(options) || {};
  const root = is(String, rootKey) ? rootKey : '';
  const ignoreInKeys = is(Array, ignore) ? [...ignore] : null;
  let dirPath;

  try {
    dirPath = resolve(path);
    const dirStats = await getStats(dirPath);

    if (!dirStats.isDirectory()) {
      const error = new LibError(LibError.Codes.FS_ERROR);
      error.setMessage(`${dirPath} is not a directory`);
      throw error;
    }
  } catch (e) {
    if (is(LibError, e)) {
      throw e;
    }

    const error = new LibError(LibError.Codes.FS_ERROR, e);
    error.setMessage(`unable to upload directory ${dirPath}, ${e.message}`);
    throw error;
  }

  debug(`uploading directory ${dirPath}...`);

  try {
    const filenames = await readdir(dirPath);

    if (is(Array, filenames)) {
      await Promise.all(filenames.map(async (filename) => {
        const filepath = posix.join(dirPath, filename);
        const fileStats = await getStats(filepath);
        const key = posix.join(root, filename);
        let isIgnored = false;

        if (exists(ignoreInKeys)) {
          const len = ignoreInKeys.length;

          for (let i = 0; i < len; i += 1) {
            if (key.includes(ignoreInKeys[i])) {
              isIgnored = true;
              break;
            }
          }
        }

        if (!isIgnored) {
          if (fileStats.isFile()) {
            parameters.Key = key;

            await uploadFile({
              path: filepath,
              params: parameters,
              options: opts,
            });
          } else if (fileStats.isDirectory()) {
            await uploadDirectory({
              params,
              options,
              path: filepath,
              rootKey: key,
              ignore: ignoreInKeys,
            });
          }
        }
      }));
    }
  } catch (e) {
    const error = new LibError(LibError.Codes.AWS_ERROR, e);
    error.setMessage(`unable to upload directory ${path}, ${e.message}`);
    debug(error.toString());
    throw error;
  }

  debug(`directory ${dirPath} successfully uploaded`);
  return true;
};

module.exports = Object.freeze({
  getObjectContent,
  getObjectHash,
  listKeys,
  upload,
  uploadFile,
  uploadDirectory,
});
