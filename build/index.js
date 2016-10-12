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

var _getSize = require('./utils/get-size');

var _getSize2 = _interopRequireDefault(_getSize);

var _generateGrid = require('./helpers/generate-grid');

var _generateGrid2 = _interopRequireDefault(_generateGrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Stash global settings in an opts obj
var ant = _postcss2.default.plugin('postcss-ant', function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    rounders: '99.99% 99.999999%'.trim().split(/\s+/),
    gutter: '30px 30px'.trim().split(/\s+/),
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
        case 'ant-gutter':
          opts.gutter = rule.params.split(/\s+/);
          rule.remove();
          break;
        case 'ant-rounders':
          opts.rounders = rule.params.split(/\s+/);
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
      // Local settings walk
      var optsParsed = (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        var optsRegexp = new RegExp(opts.namespace + '(?=gutter|rounders|support|pluck|bump|technique|children)');
        if (node.type === 'function' && optsRegexp.test(node.value)) {
          node.type = 'word'; // transform existing function node into a word so we can replace its value with a string

          switch (node.value) {
            case opts.namespace + 'gutter':
              if (node.nodes.length > 1) {
                opts.gutter = [node.nodes[0].value, node.nodes[2].value];
              } else {
                opts.gutter = [node.nodes[0].value];
              }
              break;

            case opts.namespace + 'rounders':
              opts.rounders = [node.nodes[0].value, node.nodes[2].value];
              break;

            case opts.namespace + 'support':
              opts.support = node.nodes[0].value;
              break;

            case opts.namespace + 'pluck':
              opts.pluck = Number(node.nodes[0].value);
              break;

            case opts.namespace + 'bump':
              opts.bump = ' ' + _postcssValueParser2.default.stringify(node.nodes);
              break;

            case opts.namespace + 'technique':
              opts.technique = node.nodes[0].value;
              break;

            case opts.namespace + 'children':
              opts.children = node.nodes[0].value;
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
        var powRegexp = new RegExp(opts.namespace + 'pow');
        if (node.type === 'function' && powRegexp.test(node.value)) {
          node.type = 'word';
          node.value = String(_methods2.default.pow(node));
        }
      }, true); // deep

      // sum() walk
      var sumsParsed = (0, _postcssValueParser2.default)(powsParsed.toString()).walk(function (node) {
        var sumRegexp = new RegExp(opts.namespace + 'sum');
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
        var ratioRegexp = new RegExp(opts.namespace + 'ratio');
        if (node.type === 'function' && ratioRegexp.test(node.value)) {
          numerators.push(_methods2.default.pow(node));
        }
      }, false); // shallow because I'm weaksauce :(

      _methods2.default.ratio(decl, numerators, opts);

      // Walk to grab columns() first size set length for use with rows()
      var firstColumnSetLength = 0;
      var columnsParsed = (0, _postcssValueParser2.default)(ratiosParsed.toString()).walk(function (node) {
        var columnsRegexp = new RegExp(opts.namespace + '(?=columns)');
        if (node.type === 'function' && columnsRegexp.test(node.value)) {
          if (node.value === 'columns') {
            firstColumnSetLength = _postcss2.default.list.space(_postcss2.default.list.comma(_postcssValueParser2.default.stringify(node.nodes))[0]).length;
          }
        }
      }, true);

      // Finally, we walk/process all sizes(), columns(), and rows(), and get a calc formula back from getSize.
      var sizesParsed = (0, _postcssValueParser2.default)(columnsParsed.toString()).walk(function (node) {
        var sizesRegexp = new RegExp(opts.namespace + '(?=sizes|columns|rows)');
        if (node.type === 'function' && sizesRegexp.test(node.value)) {
          switch (node.value) {
            case opts.namespace + 'sizes':
              // Replace the decl.value with the final output
              decl.value = (0, _getSize2.default)(node, opts, decl)[0];
              break;

            case opts.namespace + 'columns':
            case opts.namespace + 'rows':
              (0, _generateGrid2.default)(node, opts, node.value, decl, firstColumnSetLength);
              break;

            default:
              break;
          }
        }
      }, false);

      // Delete generate-grid if it was used
      var cleanParsed = (0, _postcssValueParser2.default)(sizesParsed.toString()).walk(function (node) {
        if (node.type === 'function') {
          if (node.value === opts.namespace + 'columns' || node.value === opts.namespace + 'rows') {
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