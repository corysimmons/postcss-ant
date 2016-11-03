'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This wrapper makes adding rules and rulesets a bit easier to declare/read.

// Usage:
// ruleSetter('.foo', ['width: 100px', 'height: 200px'], decl)

exports.default = function (selector, rules, decl, next) {
  // Creates .selector:nth-child(3n + 1) ... (3n + 2) ... (3n + 3) ... rules.
  // We typically add these before so the user can override generate-grid easily if need be.
  // But offer a next param for explicitly placing these in an intuitive place.
  if (next !== undefined) {
    _postcss2.default.rule({
      selector: selector
    }).moveAfter(decl.parent);

    rules.map(function (rule) {
      var propVal = rule.split(':');

      decl.clone({
        prop: propVal[0].trim(),
        value: propVal[1].trim()
      }).moveTo(decl.parent.next());
    });
  } else {
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
  }
};

module.exports = exports['default'];