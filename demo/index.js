'use strict';

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _precss = require('precss');

var _precss2 = _interopRequireDefault(_precss);

var _postcssScss = require('postcss-scss');

var _postcssScss2 = _interopRequireDefault(_postcssScss);

var _ = require('..');

var _2 = _interopRequireDefault(_);

var _postcssCalc = require('postcss-calc');

var _postcssCalc2 = _interopRequireDefault(_postcssCalc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var watcher = _chokidar2.default.watch(['demo/css/in.scss', 'demo/index.html'], {
  ignored: /[\/\\]\./,
  persistent: true
});

var process = function process() {
  var fileIn = _fs2.default.readFileSync('demo/css/in.scss', 'utf8');

  (0, _postcss2.default)([_precss2.default, _2.default, _postcssCalc2.default]).process(fileIn, {
    parser: _postcssScss2.default
  }).then(function (result) {
    _fs2.default.writeFile('demo/css/out.css', result.css, function (err) {
      if (err) throw err;
    });
  });
};

process();

watcher.on('change', function (path) {
  process();
});
