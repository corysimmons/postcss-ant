var postcss = require('postcss');
// var ant = require('../..');
var fs = require('fs');
var stylus = require('stylus');
var poststylus = require('poststylus');
var autoprefixer = require('autoprefixer');

// stylus(fs.readFileSync('./demo/fml/in.styl', 'utf8')).use([
//   poststylus([
//     autoprefixer({ browsers: ['ie 8'] })
//   ])
// ]);

var foo = stylus('a { width: 50%; }').use(poststylus([
  'autoprefixer'
]))

console.log(foo.str);
