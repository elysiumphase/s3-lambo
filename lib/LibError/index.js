/**
 * LibError
 *
 * - code
 * - message
 * - name
 * - stack
 * - originStack
 *
 * - setCode(value)
 * - setMessage(value)
 * - setName(value)
 * - setOriginStack(originError)
 * - toString()
 *
 * - static get Codes()
 * - static format(err) -> LibError
 */
const { object: { is, exists }, cast: { str } } = require('consis');
const Codes = require('./Codes');

class LibError extends Error {
  constructor({ code, message, name } = {}, originError) {
    super();
    const originMessage = is(Error, originError) ? originError.message : '';

    if (!this.setCode(code)) {
      this.setCode(LibError.Codes.UNKNOWN_ERROR.code);
    }

    if (!this.setMessage(message)) {
      this.setMessage(originMessage);
    }

    if (!this.setName(name)) {
      this.setName(LibError.Codes.UNKNOWN_ERROR.name);
    }

    this.setOriginStack(originError);
  }

  static get Codes() {
    return Codes;
  }

  static format(err) {
    let error;

    if (!exists(err)) {
      error = new LibError(LibError.Codes.UNKNOWN_ERROR);
    } else if (!is(LibError, err)) {
      const errSpec = {
        code: str(err.code),
        name: str(err.name),
        message: str(err.message),
      };
      error = new LibError(LibError.Codes.UNKNOWN_ERROR);

      // set proper message or keep default
      if (is(String, err.message)
      && err.message !== 'null'
      && err.message !== 'NaN'
      && err.message !== 'undefined'
      && err.message.trim() !== '') {
        error.setMessage(err.message);
      } else if (exists(errSpec.name) && errSpec.name.toLowerCase() !== 'error') {
        error.setMessage(errSpec.name);
      } else if (exists(errSpec.code) && errSpec.code.toLowerCase() !== 'error') {
        error.setMessage(err.code);
      }

      // set proper stack trace or keep original
      error.setOriginStack(err);
    } else {
      error = err;
    }

    return error;
  }

  setCode(value) {
    if (is(String, value) && (exists(LibError.Codes[value]))) {
      this.code = value;
      return true;
    }

    return false;
  }

  setMessage(value) {
    if (is(String, value)) {
      this.message = value === '' ? '' : value.trim();
      return true;
    }

    return false;
  }

  setName(value) {
    if (is(String, value) && value.trim() !== '') {
      this.name = value;
      return true;
    }

    return false;
  }

  setOriginStack(originError) {
    if (is(Error, originError) && is(String, originError.stack)) {
      this.originStack = `\n${originError.stack}`;
    } else if (this.originStack === undefined) {
      this.originStack = '';
    }
  }

  toString() {
    return `code ${this.code}\n${this.stack}${this.originStack}`;
  }
}

module.exports = LibError;
