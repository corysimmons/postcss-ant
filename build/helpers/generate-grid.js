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

var _invertBy = require('lodash/invertBy');

var _invertBy2 = _interopRequireDefault(_invertBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (node, localOpts, direction, decl, firstColumnSetLength, foundColumnsAndRows, prevSourceIndex, locallySpecified, lastColumnSetLength) {
  // Grab all the contents within the function and sort them into size sets.
  var value = _postcssValueParser2.default.stringify(node.nodes);
  var sizeSets = _postcss2.default.list.comma(value);
  var totalSizes = 0;
  sizeSets.map(function (sizeSet) {
    totalSizes += _postcss2.default.list.space(sizeSet).length;
  });

  // Determine if this is the last/first columns() or rows() call in the declaration value.
  var lastCall = false;
  var firstCall = false;
  if (node.sourceIndex > prevSourceIndex) {
    lastCall = true;
  }
  if (node.sourceIndex === 0) {
    firstCall = true;
  }

  // Set both gutters if only 1 gutter has been specified
  if (localOpts.gutters.length === 1) {
    localOpts.gutters = [localOpts.gutters[0], localOpts.gutters[0]];
  }

  // If columns() is set, and the user specifies gutters()
  if (node.type === 'function' && node.value === 'columns' && locallySpecified.gutters === true && locallySpecified.rows === false) {
    (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['margin-bottom: ' + localOpts.gutters[1]], decl);

    var lastOfNthSelector = '';
    if (/child/.test(localOpts.children)) {
      lastOfNthSelector = 'nth-last-child';
    } else if (/type/.test(localOpts.children)) {
      lastOfNthSelector = 'nth-last-of-type';
    }

    (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + lastOfNthSelector + '(-n + ' + lastColumnSetLength + ')', ['margin-bottom: 0'], decl);
  }

  // Assign grid depending on support()
  if (value !== 'reset') {
    if (firstCall) {
      if (localOpts.support === 'flexbox') {
        switch (localOpts.technique) {
          case 'nth':
            (0, _ruleSetter2.default)('' + decl.parent.selector, ['display: flex', 'flex-wrap: wrap'], decl);
            break;

          case 'negative-margin':
            if (localOpts.gutters[0] !== '0') {
              (0, _ruleSetter2.default)('' + decl.parent.selector, ['display: flex', 'flex-wrap: wrap', 'margin-right: calc(-' + localOpts.gutters[0] + ' / 2)', 'margin-left: calc(-' + localOpts.gutters[0] + ' / 2)'], decl);
              (0, _ruleSetter2.default)(decl.parent.selector + ' > *', ['margin-right: calc(' + localOpts.gutters[0] + ' / 2)', 'margin-left: calc(' + localOpts.gutters[0] + ' / 2)'], decl);
            } else {
              (0, _ruleSetter2.default)('' + decl.parent.selector, ['display: flex', 'flex-wrap: wrap', 'margin-right: 0', 'margin-left: 0'], decl);
              (0, _ruleSetter2.default)(decl.parent.selector + ' > *', ['margin-right: 0', 'margin-left: 0'], decl);
            }
            break;

          default:
            break;
        }
      } else if (localOpts.support === 'float') {
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *', ['float: left'], decl);
        (0, _ruleSetter2.default)(decl.parent.selector + '::after', ['content: \'\'', 'display: table', 'clear: both'], decl);
      }
    }
  }

  // Explicit reset support
  if (value === 'reset') {
    switch (node.value) {
      case 'columns':
        switch (localOpts.technique) {
          case 'nth':
            (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: auto', 'margin-left: 0'], decl);
            break;

          case 'negative-margin':
            (0, _ruleSetter2.default)('' + decl.parent.selector, ['margin-right: 0', 'margin-left: 0'], decl);
            (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: auto', 'margin-right: 0', 'margin-left: 0'], decl);
            break;

          default:
            break;
        }

        return;

      case 'rows':
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['height: auto', 'margin-top: 0'], decl);
        return;

      default:
        break;
    }
  }

  // Convert columns() to width and rows() to height for shorter conditionals and usage when assigning sizes to that particular dimension.
  var getDirection = function getDirection() {
    switch (direction) {
      case localOpts.namespace + 'columns':
        return 'width';

      case localOpts.namespace + 'rows':
        return 'height';

      default:
        break;
    }
  };

  // Implicitly reset dimensions and margins with each generate-grid. This prevents a huge amount of media query gotchas.
  if (foundColumnsAndRows && firstCall) {
    switch (localOpts.technique) {
      case 'nth':
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: auto', 'height: auto', 'margin-top: 0', 'margin-left: ' + localOpts.gutters[0]], decl);
        break;

      case 'negative-margin':
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: auto', 'height: auto', 'margin-top: 0', 'margin-right: calc(' + localOpts.gutters[0] + ' / 2)', 'margin-left: calc(' + localOpts.gutters[0] + ' / 2)'], decl);
        break;

      default:
        break;
    }

    (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n + ' + (firstColumnSetLength + 1) + ')', ['margin-top: ' + localOpts.gutters[1]], decl);
  } else if (firstCall) {
    switch (getDirection()) {
      case 'width':
        switch (localOpts.technique) {
          case 'nth':
            (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: auto', 'margin-left: ' + localOpts.gutters[0]], decl);
            break;

          case 'negative-margin':
            (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: auto', 'margin-right: calc(' + localOpts.gutters[0] + ' / 2)', 'margin-left: calc(' + localOpts.gutters[0] + ' / 2)'], decl);

          default:
            break;
        }

        break;

      case 'height':
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['height: auto', 'margin-top: 0'], decl);

        // This technique prevents people from having to know how many elements appear on the last row.
        (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n + ' + (firstColumnSetLength + 1) + ')', ['margin-top: ' + localOpts.gutters[1]], decl);

        break;

      default:
        break;
    }
  }

  // If columns(100%) and technique is negative-margin, then erase negative-margins
  if (node.value === 'columns' && value === '100%' && localOpts.technique === 'negative-margin') {
    (0, _ruleSetter2.default)('' + decl.parent.selector, ['margin-right: 0', 'margin-left: 0'], decl);
    (0, _ruleSetter2.default)(decl.parent.selector + ' > *:' + localOpts.children + '(n)', ['width: 100%', 'margin-right: 0', 'margin-left: 0'], decl);
    return;
  }

  var counter = 0;
  var incrementToTotalSizes = function incrementToTotalSizes() {
    counter += 1;

    if (counter <= totalSizes) {
      return counter;
    }
  };

  // Set dimension with cycling nth selector
  // Loop through each size in each size set, applying rulesets as we go.
  (0, _getSize2.default)(node, localOpts, decl).map(function (sizes) {
    // Do some work to ensure selectors (when casting sizes) are combined/stacked neatly.
    var obj = {};
    sizes.map(function (size) {
      // Cast selector: size pairs to obj
      // example: {'.foo > *:nth-child(4n + 1)': '1px', ...}
      obj[decl.parent.selector + ' > *:' + localOpts.children + '(' + totalSizes + 'n + ' + incrementToTotalSizes() + ')'] = size;
    });

    // Find matching sizes, then invert the object so selectors are in an array
    // example: {'1px': [ '.foo > *:nth-child(4n + 1)', '.foo > *:nth-child(4n + 2)' ], ...}
    var inverted = (0, _invertBy2.default)(obj); // thank god for lodash...

    // Cast our sizing-specific rulesets
    for (var size in inverted) {
      (0, _ruleSetter2.default)(inverted[size].join(',\n' + decl.raws.before.substring(3)), [getDirection() + ': ' + size], decl);
    }
  });

  // Negate column margins on nth grids
  // The first column in a row will never have a margin-left. We add the length of the previously used size set on each iteration. Start on 1.
  if (localOpts.technique === 'nth') {
    if (getDirection() === 'width') {
      (function () {
        var collectedSetLengths = 1;
        var selectors = [];
        sizeSets.map(function (sizeSet) {
          selectors.push(decl.parent.selector + ' > *:' + localOpts.children + '(' + totalSizes + 'n + ' + collectedSetLengths + ')');
          collectedSetLengths += _postcss2.default.list.space(sizeSet).length;
        });

        (0, _ruleSetter2.default)(selectors.join(',\n' + decl.raws.before.substring(3)), ['margin-left: 0'], decl);
      })();
    }
  }
};

module.exports = exports['default'];