'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (decl, error, suggestion) {
  var header = '------------------------\n   postcss-ant error:\n------------------------\n';
  var line = '   ' + decl.source.input.file + ':' + decl.source.start.line + ':' + decl.source.start.column;
  var footer = 'If you\'re pretty confident you\'re doing everything correct, please file an issue at https://github.com/corysimmons/postcss-ant/issues/new';

  if (error && suggestion) {
    console.error('\n' + header + '\n' + _chalk2.default.red('✖︎ ', error) + '\n' + _chalk2.default.red(line) + '\n\n' + _chalk2.default.green('✔︎ ', suggestion) + '\n\n' + footer + '\n    ');
  } else if (error) {
    console.error('\n' + header + '\n' + _chalk2.default.red('✖︎ ', error) + '\n' + _chalk2.default.red(line) + '\n\n' + footer + '\n    ');
  } else {
    console.error('Provide an error to errHandler, Dummy.');
  }
};

module.exports = exports['default'];