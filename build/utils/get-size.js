'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _calcHell = require('./calc-hell');

var _calcHell2 = _interopRequireDefault(_calcHell);

var _postcssValueParser = require('postcss-value-parser');

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _errorHandler = require('./error-handler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is where we split up sizes and size sets into arrays. Then we pass that to calcHell to return the appropriate calc formula.

exports.default = function (node, opts, decl) {
  // Stringify and stash the value of the function
  var value = _postcssValueParser2.default.stringify(node.nodes);

  var results = [];

  switch (node.value) {
    // If sizes(), we don't need to split into sets. We need to use pluck though.
    case opts.namespace + 'size':
    case opts.namespace + 'sizes':
      var sizes = _postcss2.default.list.space(value);

      if (sizes.find(function (size) {
        return (/,/.test(size)
        );
      })) {
        (0, _errorHandler2.default)(decl, 'You can\'t have a comma in sizes().', 'Try removing the comma. If you\'re trying to use size sets (which only work with generate-grid), use columns() and/or rows() instead of sizes().');
      }

      results.push((0, _calcHell2.default)(sizes, opts));
      break;

    // If columns or rows, we need to split sizes into sets and return a value for each size in each set.
    case opts.namespace + 'columns':
    case opts.namespace + 'rows':
      var sizeSets = _postcss2.default.list.comma(value);

      // Map over size sets and output the correct calc formula for each size in the set.
      sizeSets.map(function (set) {
        // Split sizes by space
        var sizes = _postcss2.default.list.space(set);

        var setResults = [];

        for (var i = 1; i <= sizes.length; i++) {
          // Intentionally assign pluck to 1..2..3.. so we can pluck the correct size for each size in a set.
          opts.pluck = i;
          setResults.push((0, _calcHell2.default)(sizes, opts));
        }

        results.push(setResults);
      });
      break;

    default:
      break;
  }

  return results;
};

module.exports = exports['default'];