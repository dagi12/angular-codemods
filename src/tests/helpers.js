require('babel-register');

const expect = require('chai').expect;

const Files = require('../helpers/files.js');

describe('Helpers', () => {

  describe('Files', () => {

    const testData = 'test_module:directive:first_directive:/test/directive.js\n' +
      'test2_module:directive:second_directive:/test/directive2.js\n' +
      'test_module:factory:first_factory:/test/factory.js\n' +
      'test_module:directive:third_directive:/test/directive3.js';

    const testTree = {
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
    };

    describe('loadData(data)', () => {

      it('should create the corresponding array', () => {
        expect(Files.loadData(testData)).to.deep.equal(testTree);
      });

      it('should exclude non-valid lines', () => {
        const data = 'test_module:directive:test_directive:/test/directive.js\n\n' +
          'test_module:directive:/test/no.js';

        expect(Files.loadData(data)).to.deep.equal({
          test_module: {
            directive: {
              test_directive: '/test/directive.js'
            }
          }
        });
      });

    });

    describe('flattenTree(tree)', () => {

      it('should return an array with all dependencies flatten', () => {
        expect(Files.flattenTree(testTree)).to.deep.equal([
          { module: 'test_module', type: 'directive', name: 'first_directive', path: '/test/directive.js' },
          { module: 'test_module', type: 'directive', name: 'third_directive', path: '/test/directive3.js' },
          { module: 'test_module', type: 'factory',   name: 'first_factory',   path: '/test/factory.js' },
          { module: 'test2_module', type: 'directive', name: 'second_directive', path: '/test/directive2.js' },
        ]);
      });

    });

    describe('serializeTree(tree)', () => {

      it('should write each dependency on a new line in the form module:type:name:path', () => {
        const serializedLines = Files.serializeTree(testTree).split('\n');

        expect(serializedLines.length).to.equal(4);

        // Every line in testData is present in serialized result
        expect(testData.split('\n').every(line => serializedLines.indexOf(line) !== -1)).to.be.true;
      });
    });

    describe('addToTree(tree, { module, type, name, path)', () => {

      it('should return a tree including the module, from an empty tree', () => {
        const expectation = {
          module: {
            type: {
              name: 'path',
            },
          },
        };

        const dependency = {
          module: 'module',
          type: 'type',
          name: 'name',
          path: 'path',
        };

        expect(Files.addToTree({}, dependency)).to.deep.equal(expectation);
      });

    });

  });

});
