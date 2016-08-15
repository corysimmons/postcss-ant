'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var raw = _postcss2.default.plugin('postcss-raw', function () {
  return function (css) {
    console.log(css);
  };
}); // postcss-raw
// template literals so preprocessors stfu and pass shit on to postcss plugins.
exports.default = raw;
module.exports = exports['default'];
