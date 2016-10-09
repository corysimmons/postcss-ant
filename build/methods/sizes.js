'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getSize = require('../utils/get-size');

var _getSize2 = _interopRequireDefault(_getSize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (node, options) {
  return (0, _getSize2.default)(node, options, locals, type);
};

module.exports = exports['default'];