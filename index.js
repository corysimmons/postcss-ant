'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssValueParser = require('postcss-value-parser');

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ant = _postcss2.default.plugin('postcss-ant', function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return function (css) {
    // Assign global setting defaults.
    var namespace = options.namespace || '';
    var gutter = options.gutter || '30px';
    var grid = options.grid || 'nth';
    var support = options.support || 'flexbox';
    // Did the user specify global settings?
    css.walkAtRules(function (rule) {
      if (rule.name === 'ant-namespace') {
        namespace = rule.params;
        rule.remove();
      }

      if (rule.name === 'ant-gutter') {
        gutter = rule.params;
        rule.remove();
      }

      if (rule.name === 'ant-grid') {
        grid = rule.params;
        rule.remove();
      }

      if (rule.name === 'ant-support') {
        support = rule.params;
        rule.remove();
      }
    });

    // Line for console.log()
    var line = '--------------------------------------------------------------------------';

    css.walkDecls(function (decl) {
      // Tests if user is passing size(...) OR sizes(...) and pluck(...) -- indicating this is an ant declaration value.
      var antIndication = 'sizes?([^]*?)';
      var antIndicationRegex = namespace !== '' ? new RegExp('' + namespace + antIndication, 'g') : new RegExp(antIndication, 'g');

      if (decl.value.match(antIndicationRegex) || decl.prop === namespace + 'ant') {
        (function () {
          // Sorry about all the walking -- too stupid to figure out another way. Entire damn thing needs refactored. 😜
          // 🎵 I am a sinner -- probably gonna sin again. 🎵

          // pow
          (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
            if (node.type === 'function' && node.value === 'pow') {
              var powArgs = node.nodes.filter(function (a) {
                return a.type === 'word';
              }).map(function (a) {
                return Number(a.value);
              });
              var powResult = Math.pow(powArgs[0], powArgs[1]);
              decl.value = decl.value.replace(/pow\([^]+?\)/, powResult);
            }
          });

          // sum
          (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
            if (node.type === 'function' && node.value === 'sum') {
              var sumArgs = node.nodes.filter(function (a) {
                return a.type === 'word';
              }).map(function (a) {
                return Number(a.value);
              });
              var sumResult = sumArgs.reduce(function (prev, curr) {
                return prev + curr;
              });
              decl.value = decl.value.replace(/sum\([^]+?\)/, sumResult);
            }
          });

          // ratio()
          // Collect ratios into array.
          var ratios = [];
          (0, _postcssValueParser2.default)(decl.value).walk(function (node) {
            if (node.type === 'function' && node.value === 'ratio') {
              ratios.push(node);
            }
          });

          // Loop over ratios, performing pow to create numerators. Stashing those numerators in an array.
          var numerators = [];
          ratios.forEach(function (ratio) {
            var ratioArgs = ratio.nodes.filter(function (a) {
              return a.type === 'word';
            }).map(function (a) {
              return Number(a.value);
            });
            var numerator = Math.pow(ratioArgs[0], ratioArgs[1]);
            numerators.push(numerator);
          });

          // Get sum of numerators as denominator.
          var denominator = void 0;
          if (numerators.length) {
            denominator = numerators.reduce(function (prev, curr) {
              return prev + curr;
            });
          }

          // Replace ratio() instances with the resulting fraction.
          ratios.forEach(function (ratio, i) {
            decl.value = decl.value.replace(/ratio\([^]+?\)/, numerators[i] + '/' + denominator);
          });

          // Split up params and assign them to a params object (p).
          var paramsRegex = namespace !== '' ? new RegExp('^' + namespace + 'sizes?([^]*)') : new RegExp(/^sizes?\([^]*\)/);
          var paramsArr = _postcss2.default.list.space(decl.value.match(paramsRegex)[0]);
          var p = {};
          paramsArr.forEach(function (param) {
            // Reject any non-ant params.
            var validParams = 'sizes?\\(|pluck\\(|grid\\(|gutter\\(|bump\\(|support\\(';
            var validParamsRegex = namespace !== '' ? new RegExp('^' + namespace + validParams) : new RegExp('^' + validParams);

            if (!param.match(validParamsRegex)) {
              console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': ' + _chalk2.default.red(param) + ' isn\'t a valid parameter in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nTry one of these parameters instead: ' + _chalk2.default.green('sizes, pluck, grid, gutter, bump, support') + '\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n            ');
            }

            // Strip quotes.
            var quoteless = param.replace(/'|"/g, '');

            // Get key: value matches that coorespond to each param(arg).
            var keyVal = quoteless.match(/(.*)\(([^]*)\)/);

            // Strip namespace from key.
            var namespacelessKey = keyVal[1].replace(namespace, '');

            // Assign them to the p object.
            Object.assign(p, JSON.parse('{ "' + namespacelessKey + '": "' + keyVal[2] + '" }'));
          });

          // Use global settings if no local settings exist.
          p.gutter = p.gutter || gutter;
          p.grid = p.grid || grid;
          p.support = p.support || support;

          // If singular size(...), set pluck() to 1 and sizes() to p.size.
          if (decl.value.match(/size\([^]*\)/)) {
            // Throw an error if user is trying to pass pluck() along with singular size().
            if (decl.value.match(/pluck\([^]*\)/)) {
              console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': You can\'t pass pluck(' + _chalk2.default.red(p.pluck) + ') along with ' + _chalk2.default.bold('singular') + ' size(' + _chalk2.default.red(p.size) + ') in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nTry removing pluck(' + _chalk2.default.red(p.pluck) + ') or changing size(' + _chalk2.default.red(p.size) + ') to sizes(' + _chalk2.default.green(p.size) + ').\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n            ');
            }

            // Throw error if user passes too many args to size().
            if (_postcss2.default.list.space(p.size).length > 1) {
              console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': You tried passing too many sizes to the singular ' + _chalk2.default.red('size()') + ' function in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nTry just passing a single size like size(' + _chalk2.default.green(_postcss2.default.list.space(p.size)[0]) + ')\nOr use the ' + _chalk2.default.green('sizes()') + ' function along with ' + _chalk2.default.green('pluck()') + ' instead.\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n            ');
            }

            p.sizes = p.size;
            p.pluck = 1;
          }

          // Split sizes.
          p.sizes = _postcss2.default.list.space(p.sizes);

          // Convert pluck(...) to number for use in arrays later. Everything else should be strings.
          p.pluck = Number(p.pluck);

          // Ensure bump is something usable.
          if (p.bump) {
            if (p.bump.match(/\-|\+|\*|\//g)) {
              p.bump = p.bump.replace(/\-|\+|\*|\//g, function (match) {
                return ' ' + match + ' ';
              });
            } else {
              p.bump = ' + ' + p.bump;
            }
            p.bump = ' ' + p.bump;
          }

          // If pluck(...) doesn't work with sizes(...) then throw a helpful error. These 2 args are required.
          if (!p.sizes[p.pluck - 1] && decl.prop !== namespace + 'ant') {
            console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': pluck(' + _chalk2.default.red(p.pluck) + ') isn\'t a valid index in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nRemember the indexes are 1-based, not 0-based like you\'re probably used to.\nTry pluck(' + _chalk2.default.green(p.pluck + 1) + ') instead.\n\nAlso, make sure you\'re passing ' + _chalk2.default.bold('something') + ' to your size parameter.\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n          ');
          }

          // If grid(...) is not a valid grid type, throw a helpful error.
          var gridsRegex = /^nth$|^negative-margin$/;
          if (!p.grid.match(gridsRegex)) {
            console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': grid(' + _chalk2.default.red(p.grid) + ') isn\'t a valid grid type in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nTry grid(' + _chalk2.default.green('nth') + ') or grid(' + _chalk2.default.green('negative-margin') + ') instead.\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n          ');
          }

          // Valid CSS lengths (identifies fixed numbers).
          var unitsRegex = /em$|ex$|%$|px$|cm$|mm$|in$|pt$|pc$|ch$|rem$|vh$|vw$|vmin$|vmax$/;

          // Sort sizes into fixed and fraction arrays, and count number of autos.
          var fixedArr = [];
          var fracArr = [];
          var numAuto = 0;
          p.sizes.forEach(function (size) {
            if (size.match(unitsRegex)) {
              fixedArr.push(size);
            } else if (size.match(/\/|\./)) {
              fracArr.push(size);
            } else if (size.match(/auto/)) {
              numAuto += 1;
            } else {
              console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': You didn\'t pass any appropriate sizes in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nTry something like sizes(' + _chalk2.default.green('100px 1/2 1/2') + ') or size(' + _chalk2.default.green('1/3') + ') instead.\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n            ');
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

          // Conditional Math Hell -- Abandon all hope, ye who enter here...
          var getSize = function getSize() {
            // Alias for use in billion calc formulas.
            var val = p.sizes[p.pluck - 1];
            var gut = p.gutter;
            var bump = p.bump || '';

            // val is a fixed number
            if (val.match(unitsRegex)) {
              if (bump) {
                return 'calc(' + val + bump + ')';
              } else {
                return val;
              }
            }

            // val is a fraction
            if (val.match(/\/|\./)) {
              // fraction(s) only
              if (numFrac > 0 && numFixed === 0 && numAuto === 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc(99.99% * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc(99.99% * ' + val + ' - ' + gut + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 2\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc(99.999999% * ' + val + bump + ')';
                }
              }

              // fraction(s) and fixed number(s) only
              if (numFrac > 0 && numFixed > 0 && numAuto === 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc((99.99% - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc((99.99% - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - ' + gut + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 3\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc((99.999999% - ' + sumFixed + ') * ' + val + bump + ')';
                }
              }

              // fraction(s) and auto(s) only
              if (numFrac > 0 && numAuto > 0 && numFixed === 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc(99.99% * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc(99.99% * ' + val + ' - ' + gut + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 4\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc(99.999999% * ' + val + bump + ')';
                }
              }

              // fraction(s), fixed number(s), and auto(s)
              if (numFrac > 0 && numFixed > 0 && numAuto > 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc((99.99% - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc((99.99% - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - ' + gut + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 5\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc((99.999999% - ' + sumFixed + ') * ' + val + bump + ')';
                }
              }
            }

            // val is auto
            if (val.match(/auto/)) {
              // auto(s) only
              if (numAuto > 0 && numFrac === 0 && numFixed === 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc((99.99% - ((' + numAuto + ' - 1) * ' + gut + ')) / ' + numAuto + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc((99.99% - ((' + numAuto + ') * ' + gut + ')) / ' + numAuto + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 6\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc(99.999999% / ' + numAuto + bump + ')';
                }
              }

              // auto(s) and fixed number(s) only
              if (numAuto > 0 && numFixed > 0 && numFrac === 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ' - 1) * ' + gut + ')) / ' + numAuto + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc((99.99% - ' + sumFixed + ' - ((' + numFixed + ' + ' + numAuto + ') * ' + gut + ')) / ' + numAuto + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 7\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc((99.999999% - ' + sumFixed + ') / ' + numAuto + bump + ')';
                }
              }

              // auto(s) and fraction(s) only
              if (numAuto > 0 && numFrac > 0 && numFixed === 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc(((99.99% - (99.99% * ' + sumFrac + ' - (' + gut + ' - ' + gut + ' * ' + sumFrac + '))) / ' + numAuto + ') - ' + gut + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc(((99.99% - (99.99% * ' + sumFrac + ')) / ' + numAuto + ') - ' + gut + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 8\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc((99.999999% - (99.999999% * ' + sumFrac + ')) / ' + numAuto + bump + ')';
                }
              }

              // auto(s), fraction(s), and fixed number(s)
              if (numAuto > 0 && numFrac > 0 && numFixed > 0) {
                if (gut) {
                  switch (p.grid) {
                    // nth grids
                    case 'nth':
                      return 'calc((99.99% - ((' + sumFixed + ' + (' + gut + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gut + ' - ' + gut + ' * ' + sumFrac + '))) - (' + gut + ' * ' + numAuto + ')) / ' + numAuto + bump + ')';

                    // negative-margin grids
                    case 'negative-margin':
                      return 'calc((99.99% - ((' + sumFixed + ' + (' + gut + ' * ' + numFixed + ')) + ((99.99% - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gut + ' * ' + numFrac + '))) - (' + gut + ' * ' + numAuto + ')) / ' + numAuto + ' - ' + gut + bump + ')';

                    default:
                      console.log('\n  ' + line + '\n\n  ' + _chalk2.default.red.underline('ant error') + ' 9\n\n  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new\n\n  ' + line + '\n\n                    ');
                  }
                  return;
                } else {
                  // gutless
                  return 'calc((99.999999% - (' + sumFixed + ' + ((99.999999% - ' + sumFixed + ') * ' + sumFrac + '))) / ' + numAuto + bump + ')';
                }
              }
            }
          };

          // Is this an ant decl.prop? If so, loop over it and output appropriate styles.
          if (decl.prop === namespace + 'ant') {
            // Throw error if pluck().
            if (decl.value.match(/pluck\([^]*?\)/)) {
              console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': Don\'t use ' + _chalk2.default.red('pluck()') + ' in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\n' + namespace + 'ant: ... automatically iterates over sizes to create loops with (or without) preprocessors.\n\npluck() is used to fetch a particular size, so it\'s not needed in this context.\n\nIf you\'d like to fetch a particular size, try using something like:\n\n' + decl.parent.selector + ' {\n  width: sizes(' + p.sizes + ') pluck(' + p.pluck + ');\n}\n\nIf you\'d like to combine both techniques for offsetting and such, try overwriting the loop afterwards like:\n\n' + decl.parent.selector + ' {\n  ' + namespace + 'ant: sizes(' + p.sizes + ') grid(negative-margin);\n}\n\n' + decl.parent.selector + ' > *:nth-child(' + p.pluck + ') {\n  margin-right: sizes(' + p.sizes + ') pluck(' + (p.pluck + 1) + ') bump(' + p.gutter + ' * 1.5);\n}\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n            ');
            }

            // Applies to current selector.
            if (p.support === 'flexbox') {
              decl.cloneBefore({
                prop: 'display',
                value: 'flex'
              });
              decl.cloneBefore({
                prop: 'flex-wrap',
                value: 'wrap'
              });
            } else if (p.support === 'float') {
              // Clearfix with :after selector for IE8.
              _postcss2.default.rule({
                selector: decl.parent.selector + ':after,\n' + decl.parent.selector + '::after '
              }).moveAfter(decl.parent);

              decl.clone({
                prop: 'content',
                value: '\'\''
              }).moveTo(decl.parent.next());

              decl.clone({
                prop: 'display',
                value: 'table'
              }).moveTo(decl.parent.next());

              decl.clone({
                prop: 'clear',
                value: 'both'
              }).moveTo(decl.parent.next());
            } else {
              console.log('\n' + line + '\n\n' + _chalk2.default.red.underline('ant error') + ': support(' + _chalk2.default.red(p.support) + ') isn\'t a valid support() option in:\n\n' + decl.parent.selector + ' {\n  ' + decl + ';\n}\n\nTry support(' + _chalk2.default.green('flexbox') + ') (default) or support(' + _chalk2.default.green('float') + ') instead.\n\nIf you\'re pretty sure you\'re doing everything right, please file a bug at:\nhttps://github.com/corysimmons/postcss-ant/issues/new\n\n' + line + '\n\n            ');
            }

            // Set negative margins if needed.
            if (p.grid === 'negative-margin') {
              decl.cloneBefore({
                prop: 'margin-left',
                value: 'calc(-' + p.gutter + ' / 2)'
              });

              decl.cloneBefore({
                prop: 'margin-right',
                value: 'calc(-' + p.gutter + ' / 2)'
              });
            }

            // Create rules. Override p.pluck to start at 1 and create a rule for each size in sizes().
            for (p.pluck = p.sizes.length; p.pluck >= 1; p.pluck--) {
              var antLoop = function antLoop() {
                // Creates .selector:nth-child(3n + 1) ... (3n + 2) ... (3n + 3) ... rules after the current selector.
                _postcss2.default.rule({
                  selector: decl.parent.selector + ' > *:nth-child(' + p.sizes.length + 'n + ' + p.pluck + ') '
                }).moveAfter(decl.parent);

                // Processes ant to get correct sizes.
                decl.clone({
                  prop: 'width',
                  value: getSize()
                }).moveTo(decl.parent.next());

                // Clear new rows on float layouts.
                if (p.pluck === 1) {
                  if (p.support === 'float') {
                    if (p.grid === 'nth') {
                      decl.clone({
                        prop: 'clear',
                        value: 'left'
                      }).moveTo(decl.parent.next());
                    }
                  }
                }
              };

              // Remove margin-right from last element in row in nth grids.
              if (p.grid === 'nth') {
                if (p.pluck === p.sizes.length) {
                  _postcss2.default.rule({
                    selector: decl.parent.selector + ' > *:nth-child(' + p.sizes.length + 'n + ' + p.sizes.length + ') '
                  }).moveAfter(decl.parent);

                  decl.clone({
                    prop: 'width',
                    value: getSize()
                  }).moveTo(decl.parent.next());

                  decl.clone({
                    prop: 'margin-right',
                    value: '0'
                  }).moveTo(decl.parent.next());
                } else {
                  antLoop();
                }
              } else if (p.grid === 'negative-margin') {
                antLoop();
              }
            }

            // Set margin-right on all child elements.
            _postcss2.default.rule({
              selector: decl.parent.selector + ' > * '
            }).moveAfter(decl.parent);

            if (p.support === 'float') {
              decl.clone({
                prop: 'float',
                value: 'left'
              }).moveTo(decl.parent.next());
            }

            if (p.grid === 'nth') {
              decl.clone({
                prop: 'margin-right',
                value: p.gutter
              }).moveTo(decl.parent.next());
            } else if (p.grid === 'negative-margin') {
              decl.clone({
                prop: 'margin-left',
                value: 'calc(' + p.gutter + ' / 2)'
              }).moveTo(decl.parent.next());

              decl.clone({
                prop: 'margin-right',
                value: 'calc(' + p.gutter + ' / 2)'
              }).moveTo(decl.parent.next());
            }

            // Remove selector if no other nodes present.
            if (decl.parent.nodes.every(function (node) {
              return node === decl;
            })) {
              decl.parent.remove();
            }

            // Remove ant: ... declaration.
            decl.remove();
          } else {
            decl.value = getSize();
          }
        })();
      }
    });
  };
});

exports.default = ant;
module.exports = exports['default'];
