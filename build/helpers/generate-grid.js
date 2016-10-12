'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcssValueParser = require('postcss-value-parser');

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _getSize = require('../utils/get-size');

var _getSize2 = _interopRequireDefault(_getSize);

var _ruleSetter = require('../utils/rule-setter');

var _ruleSetter2 = _interopRequireDefault(_ruleSetter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (node, opts, direction, decl, firstColumnSetLength) {
  // Assign grid depending on support()
  if (opts.support === 'flexbox') {
    (0, _ruleSetter2.default)('' + decl.parent.selector, ['display: flex', 'flex-wrap: wrap'], decl);
  } else if (opts.support === 'float') {
    (0, _ruleSetter2.default)(decl.parent.selector + ' > *', ['float: left'], decl);
    (0, _ruleSetter2.default)(decl.parent.selector + '::after', ['content: \'\'', 'display: table', 'clear: both'], decl);
  }

  // Grab all the contents within the function and sort them into size sets.
  var value = _postcssValueParser2.default.stringify(node.nodes);
  var sizeSets = _postcss2.default.list.comma(value);
  var totalSizes = 0;
  sizeSets.map(function (sizeSet) {
    totalSizes += _postcss2.default.list.space(sizeSet).length;
  });

  // Convert columns() to width and rows() to height for shorter conditionals and usage when assigning sizes to that particular dimension.
  var getDirection = function getDirection() {
    switch (direction) {
      case opts.namespace + 'columns':
        return 'width';

      case opts.namespace + 'rows':
        return 'height';

      default:
        break;
    }
  };

  // Reset dimensions and margins with each generate-grid. This prevents a huge amount of media query gotchas.
  // todo: This can be refactored to avoid media query gotchas but requires a lot of conditionals.
  switch (getDirection()) {
    case 'width':
      (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(n)', ['width: auto', 'margin-left: 0'], decl);

      (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(1n)', ['margin-left: ' + opts.gutter[0]], decl);

      break;

    case 'height':
      (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(n)', ['height: auto', 'margin-top: 0'], decl);

      // This technique prevents people from having to know how many elements appear on the last row.
      if (opts.gutter.length === 1) {
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(n + ' + (firstColumnSetLength + 1) + ')', ['margin-top: ' + opts.gutter[0]], decl);
      } else {
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(n + ' + (firstColumnSetLength + 1) + ')', ['margin-top: ' + opts.gutter[1]], decl);
      }

      break;

    default:
      break;
  }

  var counter = 0;
  var incrementToTotalSizes = function incrementToTotalSizes() {
    counter += 1;

    if (counter <= totalSizes) {
      return counter;
    }
  };

  // Loop through each size in each size set, applying rulesets as we go.
  (0, _getSize2.default)(node, opts, decl).map(function (setResults) {
    setResults.map(function (sizeResult) {
      // Set dimension with cycling nth selector
      // todo: Kill bloat. Collect sizes into an array, then loop over that array for matches. If matches, only create a single ruleset. This is probably what declarer did.
      (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(' + totalSizes + 'n + ' + incrementToTotalSizes() + ')', [getDirection() + ': ' + sizeResult], decl);
    });
  });

  // Negate column margins
  // The first column in a row will never have a margin-left.
  if (getDirection() === 'width') {
    (function () {
      var collectedSetLengths = 1;
      sizeSets.map(function (sizeSet) {
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + opts.children + '(' + totalSizes + 'n + ' + collectedSetLengths + ')', ['margin-left: 0'], decl);

        collectedSetLengths += _postcss2.default.list.space(sizeSet).length;
      });
    })();
  }
};

module.exports = exports['default'];