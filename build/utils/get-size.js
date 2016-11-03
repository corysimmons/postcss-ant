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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is where we split up sizes and size sets into arrays. Then we pass that to calcHell to return the appropriate calc formula.

exports.default = function (node, localOpts, decl) {
  // Stringify and stash the value of the function
  var value = _postcssValueParser2.default.stringify(node.nodes);

  var results = [];

  switch (node.value) {
    // If sizes(), we don't need to split into sets. We need to use pluck though.
    case localOpts.namespace + 'size':
    case localOpts.namespace + 'sizes':
      var sizes = _postcss2.default.list.space(value);
      results.push((0, _calcHell2.default)(sizes, localOpts));
      break;

    // If columns or rows, we need to split sizes into sets and return a value for each size in each set.
    case localOpts.namespace + 'columns':
    case localOpts.namespace + 'rows':
      var sizeSets = _postcss2.default.list.comma(value);

      // Map over size sets and output the correct calc formula for each size in the set.
      sizeSets.map(function (set) {
        // Split sizes by space
        var sizes = _postcss2.default.list.space(set);

        var setResults = [];

        for (var i = 1; i <= sizes.length; i++) {
          // Intentionally assign pluck to 1..2..3.. so we can pluck the correct size for each size in a set.
          localOpts.pluck = i;
          setResults.push((0, _calcHell2.default)(sizes, localOpts, node));
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