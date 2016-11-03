'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (node) {
  var args = node.nodes.filter(function (arg) {
    return arg.type === 'word';
  }).map(function (arg) {
    return Number(arg.value);
  });

  return Math.pow(args[0], args[1]);
};

module.exports = exports['default'];