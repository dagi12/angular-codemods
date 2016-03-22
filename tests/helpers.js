require('babel-register');

const expect = require('chai').expect;

const Files = require('../helpers/files.js');

describe('Helpers', () => {

  describe('Files', () => {

    describe('loadData(data)', () => {

      it('should create the corresponding array', () => {
        const testData = 'test_module:directive:first_directive:/test/directive.js\n' +
          'test2_module:directive:second_directive:/test/directive2.js\n' +
          'test_module:factory:first_factory:/test/factory.js\n' +
          'test_module:directive:third_directive:/test/directive3.js';

        expect(Files.loadData(testData)).to.deep.equal({
          'test_module': {
            'directive': {
              'first_directive': '/test/directive.js',
              'third_directive': '/test/directive3.js',
            },
            'factory': {
              'first_factory': '/test/factory.js',
            },
          },
          'test2_module': {
            'directive': {
              'second_directive': '/test/directive2.js',
            },
          },
        });
      });

    });

  });

});
