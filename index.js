'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ant = _postcss2.default.plugin('postcss-ant', function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return function (css) {
    // Assign global setting defaults.
    var globalGutter = options.gutter || '30px';
    var globalGridType = options.type || 'nth';

    // Did the user specify global settings?
    css.walkAtRules(function (rule) {
      if (rule.name === 'ant-gutter') {
        globalGutter = rule.params;
      }

      if (rule.name === 'ant-type') {
        globalGridType = rule.params;
      }
    });

    // Line for console.log()
    var line = '--------------------------------------------------------------------------';

    // Check every declaration for ant(...)[x].
    // Syntax: ant(sizes, [gutter], [grid type])[1-based index]
    css.walkDecls(function (decl) {
      if (decl.value.match(/^ant\(([^]*?)\)\s*\[(.*)\]$/)) {
        var _ret = function () {
          var gutter = globalGutter;
          var gridType = globalGridType;

          // Catch/assign args.
          var matches = decl.value.match(/^ant\(([^]*?)\)\s*\[(.*)\]$/);
          var parenArgs = _postcss2.default.list.comma(matches[1]);
          var sizes = parenArgs[0].split(/\s+/);
          var antIndex = Number(matches[2].trim()) - 1;

          if (!sizes[antIndex]) {
            console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': [' + _chalk2.default.red(matches[2]) + '] isn\'t a valid index in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nRemember the indexes are 1-based, not 0-based like you\'re probably used to.\nTry ant(' + matches[1] + ')[' + _chalk2.default.green(matches[2] - 1) + '] instead.\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n          ');
          }

          // Assign regex for mapping.
          var units = /em$|ex$|%$|px$|cm$|mm$|in$|pt$|pc$|ch$|rem$|vh$|vw$|vmin$|vmax$/;
          var gridTypes = /^nth$|^negative-margin$/;
          var resultTypes = /^little-bump$|^big-bump$|^big-unbump$/;

          var resultType = null;

          // Overwrite global settings if local settings are defined.
          parenArgs.map(function (arg) {
            if (arg !== parenArgs[0]) {
              if (arg.match(gridTypes)) {
                gridType = arg;
              } else if (arg.match(resultTypes)) {
                resultType = arg;
              } else if (arg.match(units) || arg.match(/0/)) {
                gutter = arg;
              }
            }
          });

          // Set gutter to false if it is 0. This lets us do things like `if (gutter) ...` while still having access to `${gutter}`.
          if (parseInt(gutter, 10) === 0) {
            gutter = 0;
          }

          // Sort sizes into fixed and fraction arrays, and count number of autos.
          var fixedArr = [];
          var fracArr = [];
          var numAuto = 0;
          sizes.forEach(function (size) {
            if (size.match(units)) {
              fixedArr.push(size);
            } else if (size.match(/\/|\./)) {
              fracArr.push(size);
            } else if (size.match(/auto/)) {
              numAuto += 1;
            }
          });

          // Get the sum of all the fixed numbers.
          var numFixed = fixedArr.length;
          var sumFixed = '';
          if (numFixed === 1) {
            sumFixed = '' + fixedArr.join(' + ');
          } else if (numFixed > 1) {
            sumFixed = '(' + fixedArr.join(' + ') + ')';
          } else {
            sumFixed = 0;
          }

          // Get the sum of all the fractions.
          var numFrac = fracArr.length;
          var sumFrac = '';
          if (numFrac > 0) {
            sumFrac = '(' + fracArr.join(' + ') + ')';
          } else {
            sumFrac = 0;
          }

          // Alias sizes[index] to val because it's shorter.
          var val = sizes[antIndex];

          // Section: Conditional Math Hell -- Abandon all hope, ye who enter here...

          // val is a fixed number
          if (val.match(units)) {
            if (gutter) {
              switch (gridType) {
                // nth grids
                case 'nth':
                  switch (resultType) {
                    case 'big-bump':
                      decl.value = 'calc(' + val + ' + (' + gutter + ' * 2))';
                      break;
                    case 'little-bump':
                      decl.value = 'calc(' + val + ' + ' + gutter + ')';
                      break;
                    default:
                      decl.value = val;
                  }
                  break;

                // negative-margin grids
                case 'negative-margin':
                  switch (resultType) {
                    case 'big-bump':
                      decl.value = 'calc(' + val + ' + (' + gutter + ' * 1.5))';
                      break;
                    case 'little-bump':
                      decl.value = 'calc(' + val + ' + ' + gutter + ')';
                      break;
                    default:
                      decl.value = val;
                  }
                  break;

                default:
                  console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 1\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                ');
              }
              return {
                v: void 0
              };
            } else {
              // gutless
              decl.value = '' + val;
              return {
                v: void 0
              };
            }
          }

          // val is a fraction
          if (val.match(/\/|\./)) {
            // fraction(s) only
            if (numFrac > 0 && numFixed === 0 && numAuto === 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(99.99% * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc(99.99% * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc(99.99% * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + '))';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(99.99% * ' + val + ' + (' + gutter + ' / 2))';
                        break;
                      case 'big-unbump':
                        decl.value = 'calc((99.99% * ' + val + ' - (' + gutter + ' / 2)) * -1)';
                        break;
                      case 'little-bump':
                        decl.value = 'calc(99.99% * ' + val + ')';
                        break;
                      default:
                        decl.value = 'calc(99.99% * ' + val + ' - ' + gutter + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 2\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc(99.999999% * ' + val + ')';
                return {
                  v: void 0
                };
              }
            }

            // fraction(s) and fixed number(s) only
            if (numFrac > 0 && numFixed > 0 && numAuto === 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + '))';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(99.99% * ' + val + ' + (' + gutter + ' / 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - ' + gutter + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 3\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc((99.999999% - ' + sumFixed + ') * ' + val + ')';
                return {
                  v: void 0
                };
              }
            }

            // fraction(s) and auto(s) only
            if (numFrac > 0 && numAuto > 0 && numFixed === 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(99.99% * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc(99.99% * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc(99.99% * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + '))';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(99.99% * ' + val + ' - ' + gutter + ')';
                        break;
                      case 'little-bump':
                        decl.value = 'calc(99.99% * ' + val + ')';
                        break;
                      default:
                        decl.value = 'calc(99.99% * ' + val + ' - ' + gutter + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 4\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc(99.999999% * ' + val + ')';
                return {
                  v: void 0
                };
              }
            }

            // fraction(s), fixed number(s), and auto(s)
            if (numFrac > 0 && numFixed > 0 && numAuto > 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + ') + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - (' + gutter + ' - ' + gutter + ' * ' + val + '))';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - ' + gutter + ')';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + val + ' - ' + gutter + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 5\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc((99.999999% - ' + sumFixed + ') * ' + val + ')';
                return {
                  v: void 0
                };
              }
            }
          }

          // val is auto
          if (val.match(/auto/)) {
            // auto(s) only
            if (numAuto > 0 && numFrac === 0 && numFixed === 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(((99.99% - ((' + numAuto + ' - 1) * ' + gutter + ')) / ' + numAuto + ') + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - ((' + numAuto + ' - 1) * ' + gutter + ')) / ' + numAuto + ' + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - ((' + numAuto + ' - 1) * ' + gutter + ')) / ' + numAuto + ')';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - ((' + numAuto + ') * ' + gutter + ')) / ' + numAuto + ' + (' + gutter + ' * 1.5))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - ((' + numAuto + ') * ' + gutter + ')) / ' + numAuto + ' + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - ((' + numAuto + ') * ' + gutter + ')) / ' + numAuto + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 6\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc(99.999999% / ' + numAuto + ')';
                return {
                  v: void 0
                };
              }
            }

            // auto(s) and fixed number(s) only
            if (numAuto > 0 && numFixed > 0 && numFrac === 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ' - 1) * ' + gutter + ')) / ' + numAuto + ' + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ' - 1) * ' + gutter + ')) / ' + numAuto + ' + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ' - 1) * ' + gutter + ')) / ' + numAuto + ')';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ') * ' + gutter + ')) / ' + numAuto + ' + (' + gutter + ' * 1.5))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ') * ' + gutter + ')) / ' + numAuto + ' + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ') * ' + gutter + ')) / ' + numAuto + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 7\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc((99.999999% - ' + sumFixed + ') / ' + numAuto + ')';
                return {
                  v: void 0
                };
              }
            }

            // auto(s) and fraction(s) only
            if (numAuto > 0 && numFrac > 0 && numFixed === 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(((99.99% - (99.99% * ' + sumFrac + ' - (' + gutter + ' - ' + gutter + ' * ' + sumFrac + '))) / ' + numAuto + ') + ' + gutter + ')';
                        break;
                      case 'little-bump':
                        decl.value = 'calc(((99.99% - (99.99% * ' + sumFrac + ' - (' + gutter + ' - ' + gutter + ' * ' + sumFrac + '))) / ' + numAuto + '))';
                        break;
                      default:
                        decl.value = 'calc(((99.99% - (99.99% * ' + sumFrac + ' - (' + gutter + ' - ' + gutter + ' * ' + sumFrac + '))) / ' + numAuto + ') - ' + gutter + ')';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(((99.99% - (99.99% * ' + sumFrac + ')) / ' + numAuto + ') + (' + gutter + ' / 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc(((99.99% - (99.99% * ' + sumFrac + ')) / ' + numAuto + '))';
                        break;
                      default:
                        decl.value = 'calc(((99.99% - (99.99% * ' + sumFrac + ')) / ' + numAuto + ') - ' + gutter + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 8\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc((99.999999% - (99.999999% * ' + sumFrac + ')) / ' + numAuto + ')';
                return {
                  v: void 0
                };
              }
            }

            // auto(s), fraction(s), and fixed number(s)
            if (numAuto > 0 && numFrac > 0 && numFixed > 0) {
              if (gutter) {
                switch (gridType) {
                  // nth grids
                  case 'nth':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc(((99.99% - ((' + sumFixed + ' + (' + gutter + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gutter + ' - ' + gutter + ' * ' + sumFrac + '))) - (' + gutter + ' * ' + numAuto + ')) / ' + numAuto + ') + (' + gutter + ' * 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - ((' + sumFixed + ' + (' + gutter + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gutter + ' - ' + gutter + ' * ' + sumFrac + '))) - (' + gutter + ' * ' + numAuto + ')) / ' + numAuto + ' + ' + gutter + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - ((' + sumFixed + ' + (' + gutter + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gutter + ' - ' + gutter + ' * ' + sumFrac + '))) - (' + gutter + ' * ' + numAuto + ')) / ' + numAuto + ')';
                    }
                    break;

                  // negative-margin grids
                  case 'negative-margin':
                    switch (resultType) {
                      case 'big-bump':
                        decl.value = 'calc((99.99% - ((' + sumFixed + ' + (' + gutter + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gutter + ' * ' + numFrac + '))) - (' + gutter + ' * ' + numAuto + ')) / ' + numAuto + ' + (' + gutter + ' / 2))';
                        break;
                      case 'little-bump':
                        decl.value = 'calc((99.99% - ((' + sumFixed + ' + (' + gutter + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gutter + ' * ' + numFrac + '))) - (' + gutter + ' * ' + numAuto + ')) / ' + numAuto + ')';
                        break;
                      default:
                        decl.value = 'calc((99.99% - ((' + sumFixed + ' + (' + gutter + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gutter + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gutter + ' * ' + numFrac + '))) - (' + gutter + ' * ' + numAuto + ')) / ' + numAuto + ' - ' + gutter + ')';
                    }
                    break;

                  default:
                    console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ' 9\n\nPlease file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n                  ');
                }
                return {
                  v: void 0
                };
              } else {
                // gutless
                decl.value = 'calc((99.999999% - (' + sumFixed + ' + ((99.999999% - ' + sumFixed + ') * ' + sumFrac + '))) / ' + numAuto + ')';
                return {
                  v: void 0
                };
              }
            }
          }
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    });
  };
});

exports.default = ant;
module.exports = exports['default'];
