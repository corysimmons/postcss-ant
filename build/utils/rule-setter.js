'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This wrapper makes adding rules and rulesets a bit easier to declare/read.

// Usage:
// ruleSetter(selector, [rules], decl)

exports.default = function (selector, rules, decl) {
  // Creates .selector:nth-child(3n + 1) ... (3n + 2) ... (3n + 3) ... rules immediately before the current selector.
  // We add these before so the user can override generate-grid easily if need be.
  _postcss2.default.rule({
    selector: selector
  }).moveBefore(decl.parent);

  rules.map(function (rule) {
    var propVal = rule.split(':');

    decl.clone({
      prop: propVal[0].trim(),
      value: propVal[1].trim()
    }).moveTo(decl.parent.prev());
  });
};

module.exports = exports['default'];