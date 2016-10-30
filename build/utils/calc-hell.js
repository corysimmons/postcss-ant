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
    }
  }

  // Prep arrs for: fixed (any valid CSS length), fractions (which include decimals), fr (replacing auto)
  var fixeds = [];
  var fractions = [];
  var frs = [];

  var fixedsRegexp = /em|ex|%|px$|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax/;
  var fractionsRegexp = /\/|\./;
  var frsRegexp = /fr$/;

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

  // Bail early if they're just serving a fixed number.
  if (fixedsRegexp.test(sizes[pluck])) {
    return result = formula(sizes[pluck]);
  }

  // Organize fixed numbers, fractions/decimals, and fr units, to their own arrays.
  sizes.map(function (size) {
    fixedsRegexp.test(size) ? fixeds.push(size) : null;
    fractionsRegexp.test(size) ? fractions.push(size) : null;
    frsRegexp.test(size) ? frs.push(size) : null;
  });

  // Condense fixed numbers to a single value. We can still pluck single values from the existing arrays -- this just helps make our formulas smaller.
  var sumFixed = fixeds.length ? fixeds.reduce(function (prev, curr) {
    return prev + ' + ' + curr;
  }) : '';

  // Convert fractions to floats and combine with user-defined floats. Again, condensing to a single value for cleaner formulas.
  var sumFraction = void 0;
  if (fractions.length) {
    sumFraction = fractions.reduce(function (prev, curr) {
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

  // Condensing fr units for cleaner formulas.
  var sumFr = frs.length ? frs.reduce(function (prev, curr) {
    return parseInt(prev, 10) + parseInt(curr, 10) + 'fr';
  }) : null;

  var val = '';
  if (frsRegexp.test(sizes[pluck])) {
    var thisFr = sizes[pluck].replace('fr', '');
    val = thisFr;
    // todo: continue replacing auto with fr sizes
  } else {
    val = sizes[pluck];
  }

  // Aliases/caching for terser/faster formulas
  var tech = localOpts.technique;
  var gut = parseInt(localOpts.gutters[0], 10) !== 0 ? localOpts.gutters[0] : 0;
  var bump = localOpts.bump;

  var valFixed = fixedsRegexp.test(val) ? true : false;
  var valFraction = fractionsRegexp.test(val) ? true : false;
  var valFr = frsRegexp.test(val) ? true : false;

  var numFixed = fixeds.length;
  var numFractions = fractions.length;
  var numFrs = frs.length;

  // If gutter, use first rounder, if no gutter, use second rounder. Alias for terser formulas.
  var rounder = function rounder(gut) {
    if (gut !== 0) {
      return localOpts.rounders[0];
    } else {
      return localOpts.rounders[1];
    }
  };

  // console.log all sizes and settings
  var s = function s() {
    console.log('\nsizes: ' + String(sizes) + '\n\nlocalOpts: ' + JSON.stringify(localOpts, null, 2) + '\n    ');
  };

  // Conditional Calc Hell! Abandon hope! 👺

  // val is a fixed is covered above ^

  // val is a fraction
  if (fractionsRegexp.test(val)) {
    // fraction(s) only
    if (valFraction && numFixed === 0 && numFrs === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(rounder(gut) + ' * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump);
          case 'negative-margin':
            return result = formula(rounder(gut) + ' * ' + val + ' - ' + gut + bump);
          default:
            return;
        }
      } else {
        return result = formula(rounder(gut) + ' * ' + val + bump);
      }
    }

    // fraction(s) and fixed number(s) only
    if (valFraction && numFixed > 0 && numFrs === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump);
          case 'negative-margin':
            return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ' + (' + gut + ' * ' + numFixed + '))) * ' + val + ' - ' + gut + bump);
          default:
            return;
        }
        return;
      } else {
        return result = formula('(' + rounder(gut) + ' - (' + sumFixed + ')) * ' + val + bump);
      }
    }

    // fraction(s) and auto(s) only
    if (numFractions > 0 && numFrs > 0 && numFixed === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(rounder(gut) + ' * ' + val + ' - (' + gut + ' - ' + gut + ' * ' + val + ')' + bump);
          case 'negative-margin':
            return result = formula(rounder(gut) + ' * ' + val + ' - ' + gut + bump);
          default:
            return;
        }
        return;
      } else {
        return result = formula(rounder(gut) + ' * ' + val + bump);
      }
    }
  } // end val is fraction

  return 'postcss-ant: How did you get here? Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new';
};

module.exports = exports['default'];