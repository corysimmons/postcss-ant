'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (ugly) {
  return console.log('🤖\n\n' + JSON.stringify(ugly, null, 2) + '\n');
};

module.exports = exports['default'];