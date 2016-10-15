'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssValueParser = require('postcss-value-parser');

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Usage:
// helpfulErr(decl, `You can't combine that stuff!`, `Try not combining that stuff.`)
var helpfulErr = function helpfulErr(decl, error, suggestion) {
  var header = '------------------------\n   postcss-ant error:\n------------------------\n';
  var line = '   ' + decl.source.input.file + ':' + decl.source.start.line + ':' + decl.source.start.column;
  var footer = 'If you\'re pretty confident you\'re doing everything correctly -- or the error could be worded better -- please file an issue at https://github.com/corysimmons/postcss-ant/issues/new';

  if (error && suggestion) {
    console.error('\n' + header + '\n' + _chalk2.default.red('✖︎ ', error) + '\n' + _chalk2.default.red(line) + '\n\n' + _chalk2.default.green('✔︎ ', suggestion) + '\n\n' + footer + '\n    ');
  } else if (error) {
    console.error('\n' + header + '\n' + _chalk2.default.red('✖︎ ', error) + '\n' + _chalk2.default.red(line) + '\n\n' + footer + '\n    ');
  }
};

exports.default = function (opts, decl) {
  // Collect all used functions into array to ensure they don't clash.
  var usedFuncs = [];

  // Stash relevant values
  var gutterVal = '';
  var rounderVal = '';
  (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
    var funcsRegexp = new RegExp(opts.namespace + '(?=sizes?|rows|columns|gutters?|rounders?|support|pluck|bump|technique|children)', 'g');
    if (node.type === 'function' && funcsRegexp.test(node.value)) {
      usedFuncs.push(node.value);

      // Ensure all ant methods have some value to them.
      if (node.nodes.length < 1) {
        helpfulErr(decl, node.value + '() is empty.', 'You need to pass an argument to ' + node.value + '. If you\'re trying to use a preprocessor mixin with the same name, you\'ll need to namespace the mixin by wrapping the mixin in a namespaced mixin, or postcss-ant by using @ant-namespace.');
      }

      // Stash gutter() val
      if (node.value === 'gutter') {
        gutterVal = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes));
      }

      // Stash rounder() val
      if (node.value === 'rounder') {
        rounderVal = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes));
      }
    }
  }, true);

  // If size() refuse pluck()
  if (usedFuncs.indexOf('size') !== -1 && usedFuncs.indexOf('pluck') !== -1) {
    helpfulErr(decl, 'You can\'t pluck() from the singular size().', 'Remove pluck() or use the plural sizes().');
  }

  // If sizes() desire pluck()
  if (usedFuncs.indexOf('sizes') !== -1 && usedFuncs.indexOf('pluck') === -1) {
    helpfulErr(decl, 'sizes() doesn\'t have a pluck().', 'sizes() requires you to pluck() a single size from it. So add pluck(). If you\'re just trying to get the size of a single value, you can use size() without pluck().');
  }

  // If generate-grid
  var ggRegexp = new RegExp(opts.namespace + '(?=generate-grid|gg)');
  if (ggRegexp.test(decl.prop)) {
    // Refuse size(), sizes(), and pluck(). Desire columns() and/or rows().
    if (usedFuncs.indexOf('size') !== -1 || usedFuncs.indexOf('sizes') !== -1 || usedFuncs.indexOf('pluck') !== -1) {
      helpfulErr(decl, 'size(), sizes(), or pluck() found in generate-grid.', 'size(), sizes(), and pluck() are single size-getting methods. generate-grid generates multiple sizes in the form of columns and/or rows. Use columns() and/or rows() instead.');
    }
  }

  // If size() or sizes()
  if (usedFuncs.indexOf('size') !== -1 || usedFuncs.indexOf('sizes') !== -1) {
    // Refuse columns() and rows()
    if (usedFuncs.indexOf('columns') !== -1 || usedFuncs.indexOf('rows') !== -1) {
      helpfulErr(decl, 'columns() or rows() found alongside size() or sizes().', 'columns() and rows() are exclusively used in generate-grid. If you\'re trying to cast a grid with columns and/or rows, use generate-grid. If you\'re trying to return a single size, just use size() or sizes() & pluck().');
    }

    // Refuse gutters()
    if (usedFuncs.indexOf('gutters') !== -1) {
      helpfulErr(decl, 'Plural gutters() found in singular context.', 'Use gutter() alongside size() or sizes(). The plural signifies there are multiple gutters at work.');
    }
  }

  // If gutter() ensure single value
  if (usedFuncs.indexOf('gutter') !== -1 && gutterVal.length > 1) {
    helpfulErr(decl, 'Too many values found in gutter().', 'The singular gutter() was found with multiple values. Just pass one value to it. If you\'re trying to set the horizontal and vertical gutters between columns/rows within generate-grid use the plural gutters().');
  }

  // If rounder() ensure single value
  if (usedFuncs.indexOf('rounder') !== -1 && rounderVal.length > 1) {
    helpfulErr(decl, 'Too many values found in rounder().', 'The singular rounder() was found with multiple values. Just pass one value to it. If you\'re trying to set multiple rounding values use the plural rounders().');
  }
};

module.exports = exports['default'];