"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// todo: This works pretty well, but isn't technically correct. ratio() doesn't take nesting into context and using regex for this isn't optimal.
// Will revisit when someone complains. In the meantime, would really appreciate some insight on how to solve this and/or a PR.
exports.default = function (decl, numerators, opts) {
  if (numerators.length) {
    (function () {
      var denominator = numerators.reduce(function (prev, curr) {
        return prev + curr;
      });
      var ratioRegexp = new RegExp(opts.namespace + "ratio\\([^]+?\\)");

      numerators.forEach(function (numerator, i) {
        decl.value = decl.value.replace(ratioRegexp, numerators[i] + "/" + denominator);
      });
    })();
  }
};

module.exports = exports["default"];