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

  return args.reduce(function (prev, curr) {
    return prev + curr;
  });
};

module.exports = exports['default'];