const { expect } = require('./Common');
const lib = require('../src');

describe('#lib', function() {
  context('when requiring lib', function() {
    it('should return the expected functions', function() {
      Object.keys(lib).forEach((key) => {
        expect(lib[key]).to.be.a('function');
      });
    });
  });
});
