'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcssValueParser = require('postcss-value-parser');

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This is where we:
//   1. Distribute all sizes to respective arrays
//   2. Reduce those arrays to single values (for cleaner formulas)
//   3. Return a clean calc formula (via string building functions) based on localOpts and the pluck index

exports.default = function (sizes, localOpts, node) {
  // Stash function name and value if node exists
  var funcName = '';
  var value = '';
  if (node) {
    if (node.type === 'function') {
      // Name of the function
      funcName = node.value;
      // Whatever the function contains
      value = _postcssValueParser2.default.stringify(node.nodes);
    }
  }

  // Ensure bump() is a usable value
  if (localOpts.bump !== '') {
    localOpts.bump = localOpts.bump.trim();

    // Strip any quotes from bump
    if (/'|"/g.test(localOpts.bump)) {
      localOpts.bump = localOpts.bump.replace(/'|"/g, '');
    }

    // Put a space between operators in bump() if none exists. e.g. bump(+2px) turns into calc(... + 2px)
    var operatorRegexp = /(\+|-|\*|\/)(?=[^\s])/g;
    if (operatorRegexp.test(localOpts.bump)) {
      localOpts.bump = localOpts.bump.replace(operatorRegexp, function (operator) {
        return operator + ' ';
      });
    } else {
      // If a preprocessor strips the operator, or if no operator provided, assume +
      localOpts.bump = ' + ' + localOpts.bump;
    }
  }

  // Prep arrs for: fixed (any valid CSS length), fractions (which include decimals), fr (replacing auto)
  var fixeds = [];
  var fractions = [];
  var autos = [];

  var fixedsRegexp = /em|ex|%|px$|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax/;
  var fractionsRegexp = /\/|\./;
  var autosRegexp = /auto/;

  // Final return value
  var result = '';

  // Function to return the final calc formula
  function formula(formula) {
    if (localOpts.bump !== '' && fixedsRegexp.test(sizes[pluck])) {
      return 'calc(' + formula + ' ' + localOpts.bump + ')';
    } else if (fixedsRegexp.test(sizes[pluck])) {
      return sizes[pluck];
    } else if (localOpts.bump !== '') {
      return 'calc((' + formula + ') ' + localOpts.bump + ')';
    } else {
      return 'calc(' + formula + ')';
    }
  }

  // Subtract 1 from pluck so it can be nth compatible (good for preprocessor looping), but easily interpolated in formulas.
  var pluck = localOpts.pluck - 1;

  // Organize fixed numbers, fractions/decimals, and auto units, to their own arrays.
  sizes.map(function (size) {
    fixedsRegexp.test(size) ? fixeds.push(size) : null;
    fractionsRegexp.test(size) ? fractions.push(size) : null;
    autosRegexp.test(size) ? autos.push(size) : null;
  });

  // Condense fixed numbers to a single value. We can still pluck single values from the existing arrays -- this just helps make our formulas smaller.
  var sumFixed = fixeds.length ? fixeds.reduce(function (prev, curr) {
    return prev + ' + ' + curr;
  }) : '';

  // Convert fractions to floats and combine with user-defined floats. Again, condensing to a single value for cleaner formulas.
  var sumFrac = 0;
  if (fractions.length) {
    sumFrac = fractions.reduce(function (prev, curr) {
      if (typeof prev === 'string') {
        if (/\//.test(prev)) {
          prev = prev.split('/')[0] / prev.split('/')[1];
        }
      }

      if (typeof curr === 'string') {
        if (/\//.test(curr)) {
          curr = Number(curr.split('/')[0]) / Number(curr.split('/')[1]);
        }
      }

      return prev + Number(curr);
    }, 0);
  }

  // Aliases/caching for terser/faster formulas
  var val = sizes[pluck];
  var tech = localOpts.technique;
  var gut = parseInt(localOpts.gutters[0], 10) !== 0 ? localOpts.gutters[0] : 0;
  var bump = localOpts.bump;

  var valFixed = fixedsRegexp.test(val) ? true : false;
  var valFraction = fractionsRegexp.test(val) ? true : false;
  var valAuto = autosRegexp.test(val) ? true : false;

  var numFixed = fixeds.length;
  var numFrac = fractions.length;
  var numAuto = autos.length;

  // If gutter, use first rounder, if no gutter, use second rounder. Alias for terser formulas.
  var rounder = function rounder(gut) {
    if (gut !== 0) {
      return localOpts.rounders[0];
    } else {
      return localOpts.rounders[1];
    }
  };

  // Conditional Calc Hell! Abandon hope! 👺

  // val is fixed
  if (fixedsRegexp.test(sizes[pluck])) {
    return result = formula(sizes[pluck]);
  }

  // val is a fraction
  if (valFraction) {
    // fraction(s) only
    if (numFixed === 0 && numAuto === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(rounder(gut) + ' * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')');
          case 'negative-margin':
            return result = formula(rounder(gut) + ' * ' + val + ' - ' + gut);
          default:
            return;
        }
        return;
      } else {
        return result = formula(rounder(gut) + ' * ' + val);
      }
    }

    // fraction(s) and fixed number(s) only
    if (numFixed > 0 && numAuto === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')');
          case 'negative-margin':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - ' + gut);
          default:
            return;
        }
        return;
      } else {
        return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ')) * ' + val);
      }
    }

    // fraction(s) and auto(s) only
    if (numAuto > 0 && numFixed === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(rounder(gut) + ' * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')');
          case 'negative-margin':
            return result = formula(rounder(gut) + ' * ' + val + ' - ' + gut);
          default:
            return;
        }
        return;
      } else {
        return result = formula(rounder(gut) + ' * ' + val);
      }
    }

    // fraction(s), fixed number(s), and auto(s)
    if (numFixed > 0 && numAuto > 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')');
          case 'negative-margin':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - ' + gut);
          default:
            return;
        }
        return;
      } else {
        return result = formula('(' + rounder(gut) + ' - ' + sumFixed + ') * ' + val);
      }
    }
  } // end val is fraction

  // val is auto
  if (valAuto) {
    // auto(s) only
    if (numFrac === 0 && numFixed === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('(' + rounder(gut) + ' - ((' + numAuto + ' - 1) * ' + gut + ')) / ' + numAuto);
          case 'negative-margin':
            return result = formula('(' + rounder(gut) + ' - ((' + numAuto + ') * ' + gut + ')) / ' + numAuto);
          default:
            return;
        }
        return;
      } else {
        return result = formula(rounder(gut) + ' / ' + numAuto);
      }
    }

    // auto(s) and fixed number(s) only
    if (numFixed > 0 && numFrac === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ') - ((' + numFixed + ' + ' + numAuto + ' - 1) * ' + gut + ')) / ' + numAuto);
          case 'negative-margin':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ') - ((' + numFixed + ' + ' + numAuto + ') * ' + gut + ')) / ' + numAuto);
          default:
            return;
        }
        return;
      } else {
        return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ')) / ' + numAuto);
      }
    }

    // auto(s) and fraction(s) only
    if (numFrac > 0 && numFixed === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('((' + rounder(gut) + ' - (' + rounder(gut) + ' * ' + sumFrac + ' - (' + gut + ' - ' + gut + ' * ' + sumFrac + '))) / ' + numAuto + ') - ' + gut);
          case 'negative-margin':
            return result = formula('((' + rounder(gut) + ' - (' + rounder(gut) + ' * ' + sumFrac + ')) / ' + numAuto + ') - ' + gut);
          default:
            return;
        }
        return;
      } else {
        return result = formula('(' + rounder(gut) + ' - (' + rounder(gut) + ' * ' + sumFrac + ')) / ' + numAuto);
      }
    }

    // auto(s), fraction(s), and fixed number(s)
    if (numFrac > 0 && numFixed > 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('(' + rounder(gut) + ' - ((' + sumFixed + ' + (' + gut + ' * ' + numFixed + ')) + ((' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + sumFrac + ' - (' + gut + ' - ' + gut + ' * ' + sumFrac + '))) - (' + gut + ' * ' + numAuto + ')) / ' + numAuto);
          case 'negative-margin':
            return result = formula('(' + rounder(gut) + ' - ((' + sumFixed + ' + (' + gut + ' * ' + numFixed + ')) + ((' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + sumFrac + ' - ' + gut + ')) - ' + gut + ') / ' + numAuto + ' - ' + gut);
          default:
            return;
        }
        return;
      } else {
        return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + ((' + rounder(gut) + ' - ' + sumFixed + ') * ' + sumFrac + '))) / ' + numAuto);
      }
    }
  } // end val is auto

  return 'postcss-ant: calc-hell.js fell through. Please file a bug with your CSS at https://github.com/corysimmons/postcss-ant/issues/new';
};

module.exports = exports['default'];