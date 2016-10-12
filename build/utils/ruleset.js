'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Cleaning up PostCSS' rulesetting abilities.

// Usage:
// ruleset(selector, [rules], decl)

exports.default = function (selector, rules, decl) {
  // Creates .selector:nth-child(3n + 1) ... (3n + 2) ... (3n + 3) ... rules after the current selector.
  _postcss2.default.rule({
    selector: selector + ' '
  }).moveAfter(decl.parent);

  rules.map(function (rule) {
    var propVal = rule.split(':');

    decl.clone({
      prop: propVal[0].trim(),
      value: propVal[1].trim()
    }).moveTo(decl.parent.next());
  });
};

module.exports = exports['default'];