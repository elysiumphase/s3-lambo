// internal errors
const Codes = {
  AWS_NO_SUCH_KEY: {
    code: 'AWS_NO_SUCH_KEY',
    message: 'no such key',
    name: 'AWSError',
  },
  AWS_ERROR: {
    code: 'AWS_ERROR',
    message: 'aws error',
    name: 'AWSError',
  },
  FS_ERROR: {
    code: 'FS_ERROR',
    message: 'file system error',
    name: 'FSError',
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'unknown error',
    name: 'LibError',
  },
};

module.exports = Codes;
