'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssValueParser = require('postcss-value-parser');

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _methods = require('./methods');

var _methods2 = _interopRequireDefault(_methods);

var _errorHandler = require('./utils/error-handler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _getSize = require('./utils/get-size');

var _getSize2 = _interopRequireDefault(_getSize);

var _generateGrid = require('./helpers/generate-grid');

var _generateGrid2 = _interopRequireDefault(_generateGrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Stash global settings in an opts obj
var ant = _postcss2.default.plugin('postcss-ant', function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    rounders: _postcss2.default.list.comma('99.99%, 99.999999%'),
    gutters: _postcss2.default.list.comma('30px, 30px'),
    bump: '',
    pluck: 1,
    namespace: '',
    support: 'flexbox',
    technique: 'nth',
    children: 'nth-child'
  };

  return function (css) {
    // Update global settings if there are atRule settings
    css.walkAtRules(function (rule) {
      switch (rule.name) {
        case 'ant-namespace':
          opts.namespace = rule.params;
          rule.remove();
          break;
        case 'ant-gutters':
          opts.gutters = _postcss2.default.list.comma(rule.params);
          rule.remove();
          break;
        case 'ant-rounders':
          opts.rounders = _postcss2.default.list.comma(rule.params);
          rule.remove();
          break;
        case 'ant-support':
          opts.support = rule.params;
          rule.remove();
          break;
        case 'ant-technique':
          opts.technique = rule.params;
          rule.remove();
          break;
        case 'ant-children':
          opts.children = rule.params;
          rule.remove();
          break;
        default:
          break;
      }
    });

    // Walk declarations. Shallow walk with valueParser to stash local opts in opts obj. Then deepest-first walks over methods.
    css.walkDecls(function (decl) {
      // Ensure user is combining methods correctly.
      // Throw helpful suggestions to help newcomers. Don't be too strict and limit boundary-pushers.
      (0, _errorHandler2.default)(opts, decl);

      var localOpts = {
        rounders: opts.rounders,
        gutters: opts.gutters,
        bump: opts.bump,
        pluck: opts.pluck,
        namespace: opts.namespace,
        support: opts.support,
        technique: opts.technique,
        children: opts.children
      };

      // Create object to pass to various helpers to determine if something was specified on a local level.
      // Everything defaults to false and is converted to true if so.
      var locallySpecified = {
        gutters: false,
        rows: false
      };

      // Local settings walk
      var optsParsed = (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        var optsRegexp = new RegExp(localOpts.namespace + '(?=gutters?|rounders?|support|pluck|bump|technique|children)');
        if (node.type === 'function' && optsRegexp.test(node.value)) {
          node.type = 'word'; // transform existing function node into a word so we can replace its value with a string

          switch (node.value) {
            case localOpts.namespace + 'gutter':
            case localOpts.namespace + 'gutters':
              locallySpecified.gutters = true;
              localOpts.gutters = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes)) ? _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes)) : opts.gutters;
              break;

            case localOpts.namespace + 'rounder':
            case localOpts.namespace + 'rounders':
              localOpts.rounders = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes)) ? _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes)) : opts.rounders;
              break;

            case localOpts.namespace + 'support':
              localOpts.support = _postcssValueParser2.default.stringify(node.nodes) ? _postcssValueParser2.default.stringify(node.nodes) : opts.support;
              break;

            case localOpts.namespace + 'pluck':
              localOpts.pluck = Number(_postcssValueParser2.default.stringify(node.nodes)) ? Number(_postcssValueParser2.default.stringify(node.nodes)) : opts.pluck;
              break;

            case localOpts.namespace + 'bump':
              localOpts.bump = ' ' + _postcssValueParser2.default.stringify(node.nodes) ? ' ' + _postcssValueParser2.default.stringify(node.nodes) : opts.bump;
              break;

            case localOpts.namespace + 'technique':
              localOpts.technique = _postcssValueParser2.default.stringify(node.nodes) ? _postcssValueParser2.default.stringify(node.nodes) : opts.technique;
              break;

            case localOpts.namespace + 'children':
              localOpts.children = _postcssValueParser2.default.stringify(node.nodes) ? _postcssValueParser2.default.stringify(node.nodes) : opts.children;
              break;

            default:
              break;
          }

          // Poorly erase the function (leaves whitespace). It would be nice if there was a .remove() method in valueParser.
          node.value = '';
        }
      }, false); // shallow

      // pow() walk
      var powsParsed = (0, _postcssValueParser2.default)(optsParsed.toString()).walk(function (node) {
        var powRegexp = new RegExp(localOpts.namespace + 'pow');
        if (node.type === 'function' && powRegexp.test(node.value)) {
          node.type = 'word';
          node.value = String(_methods2.default.pow(node));
        }
      }, true); // deep

      // sum() walk
      var sumsParsed = (0, _postcssValueParser2.default)(powsParsed.toString()).walk(function (node) {
        var sumRegexp = new RegExp(localOpts.namespace + 'sum');
        if (node.type === 'function' && sumRegexp.test(node.value)) {
          node.type = 'word';
          node.value = String(_methods2.default.sum(node));
        }
      }, true); // deep

      // Assign the current decl.value to whatever has been processed so far.
      // Trimming to remove excess spaces created when we removed local setting methods (e.g. the space left over after pluck() is removed).
      decl.value = sumsParsed.toString().trim();

      // Prep arr to collect all the ratio()s in this specific decl.value
      var numerators = [];

      // ratio() walk
      var ratiosParsed = (0, _postcssValueParser2.default)(sumsParsed.toString()).walk(function (node) {
        var ratioRegexp = new RegExp(localOpts.namespace + 'ratio');
        if (node.type === 'function' && ratioRegexp.test(node.value)) {
          numerators.push(_methods2.default.pow(node));
        }
      }, false); // shallow because I'm weaksauce :(

      _methods2.default.ratio(decl, numerators, localOpts);

      // Walk to grab columns() first size set length for use with rows().
      // Also check if columns is set.
      var columnsRegexp = new RegExp(localOpts.namespace + '(?=columns)');
      var foundColumns = false;
      var firstColumnSetLength = 0;
      (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        if (node.type === 'function' && columnsRegexp.test(node.value)) {
          foundColumns = true;

          var firstColumnSet = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes))[0];

          if (firstColumnSet !== 'reset') {
            firstColumnSetLength = _postcss2.default.list.space(firstColumnSet).length;
          }
        }
      }, true);

      // Walk to grab columns() last size set length for use with generate-grid.
      var lastColumnSetLength = 0;
      (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        if (node.type === 'function' && columnsRegexp.test(node.value)) {
          var numberOfColumnSizeSets = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes)).length;
          var lastColumnSet = _postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes))[numberOfColumnSizeSets - 1];

          if (lastColumnSet !== 'reset') {
            lastColumnSetLength = _postcss2.default.list.space(lastColumnSet).length;
          }
        }
      }, true);

      // Does the decl.value contain both columns() and rows()? Stash bool for use in generate-grid (to help cleanup output).
      var foundColumnsAndRows = false;
      if (foundColumns) {
        (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
          var rowsRegexp = new RegExp(localOpts.namespace + '(?=rows)');
          if (node.type === 'function' && rowsRegexp.test(node.value)) {
            locallySpecified.rows = true;
            foundColumnsAndRows = true;
          }
        }, true);
      }

      // Finally, we walk/process all sizes(), columns(), and rows(), and get a calc formula back from getSize.
      var prevSourceIndex = 0;
      var sizesParsed = (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        var sizesRegexp = new RegExp(localOpts.namespace + '(?=sizes?|columns|rows)');
        if (node.type === 'function' && sizesRegexp.test(node.value)) {
          switch (node.value) {
            case localOpts.namespace + 'size':
            case localOpts.namespace + 'sizes':
              // Replace the decl.value with the final output
              decl.value = (0, _getSize2.default)(node, localOpts, decl)[0];
              break;

            case localOpts.namespace + 'columns':
            case localOpts.namespace + 'rows':
              var ggRegexp = new RegExp(localOpts.namespace + '(?=generate-grid|gg)');
              // Ensure the property is generate-grid or gg
              if (ggRegexp.test(decl.prop)) {
                (0, _generateGrid2.default)(node, localOpts, node.value, decl, firstColumnSetLength, foundColumnsAndRows, prevSourceIndex, locallySpecified, lastColumnSetLength);
              }
              break;

            default:
              break;
          }
        }
      }, false);

      // Delete generate-grid if it was used
      var cleanParsed = (0, _postcssValueParser2.default)(sizesParsed.toString()).walk(function (node) {
        if (node.type === 'function') {
          if (node.value === localOpts.namespace + 'columns' || node.value === localOpts.namespace + 'rows') {
            // Remove selector if no other nodes present.
            if (decl.parent) {
              if (decl.parent.nodes.every(function (node) {
                return node === decl;
              })) {
                decl.parent.remove();
              }
            }

            // Remove generate-grid declaration.
            decl.remove();
          }
        }
      }, true);
    });
  };
});

exports.default = ant;
module.exports = exports['default'];