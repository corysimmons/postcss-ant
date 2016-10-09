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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Stash global settings in an opts obj
var ant = _postcss2.default.plugin('postcss-ant', function () {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {
    rounders: '99.99% 99.999999%'.trim().split(/\s+/),
    gutter: '30px 30px'.trim().split(/\s+/),
    bump: '',
    pluck: 1,
    namespace: '',
    support: 'flexbox',
    technique: 'nth'
  } : arguments[0];

  return function (css) {
    // Update global settings if there are atRule settings
    css.walkAtRules(function (rule) {
      switch (rule.name) {
        case 'ant-namespace':
          opts.namespace = rule.params;
          break;
        case 'ant-gutter':
          opts.gutter = rule.params.split(/\s+/);
          break;
        case 'ant-rounders':
          opts.rounders = rule.params.split(/\s+/);
          break;
        case 'ant-support':
          opts.support = rule.params;
          break;
        case 'ant-technique':
          opts.technique = rule.params;
          break;
        default:
          break;
      }

      rule.remove();
    });

    // Walk declarations. Shallow walk with valueParser to stash local opts in opts obj. Then deepest-first walks over methods.
    css.walkDecls(function (decl) {
      // Local settings walk
      var optsParsed = (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
        var optsRegexp = new RegExp(opts.namespace + '(?=gutter|rounders|support|pluck|bump|technique)');
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

      // Finally, we walk/process all sizes(), columns(), and rows(), and get a calc formula back from getSize.
      var sizesParsed = (0, _postcssValueParser2.default)(ratiosParsed.toString()).walk(function (node) {
        var sizesRegexp = new RegExp(opts.namespace + '(?=sizes|columns|rows)');
        if (node.type === 'function' && sizesRegexp.test(node.value)) {
          switch (node.value) {
            case opts.namespace + 'sizes':
              // Replace the decl.value with the final output
              decl.value = (0, _getSize2.default)(node, opts, decl)[0];
              break;

            case opts.namespace + 'columns':
            case opts.namespace + 'rows':
              console.log('Handle with helpers/generate-grid.js');
              break;

            default:
              break;
          }
        }
      }, false);
    });
  };
});

exports.default = ant;
module.exports = exports['default'];