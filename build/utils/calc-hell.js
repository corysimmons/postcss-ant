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
//   3. Return a clean calc formula (via string building functions) based on opts and the pluck index

exports.default = function (sizes, opts, node) {
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
  if (opts.bump !== '') {
    opts.bump = opts.bump.trim();

    // Strip any quotes from bump
    if (/'|"/g.test(opts.bump)) {
      opts.bump = opts.bump.replace(/'|"/g, '');
    }

    // Put a space between operators in bump() if none exists. e.g. bump(+2px) turns into calc(... + 2px)
    var operatorRegexp = /(\+|-|\*|\/)(?=[^\s])/g;
    if (operatorRegexp.test(opts.bump)) {
      opts.bump = opts.bump.replace(operatorRegexp, function (operator) {
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
    if (opts.bump !== '' && fixedsRegexp.test(sizes[pluck])) {
      return 'calc(' + formula + ' ' + opts.bump + ')';
    } else if (fixedsRegexp.test(sizes[pluck])) {
      return sizes[pluck];
    } else if (opts.bump !== '') {
      return 'calc((' + formula + ') ' + opts.bump + ')';
    } else {
      return 'calc(' + formula + ')';
    }
  }

  // Subtract 1 from pluck so it can be nth compatible (good for preprocessor looping), but easily interpolated in formulas.
  var pluck = opts.pluck - 1;

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

  // Allows us to interpolate specific string combos within a formula's template literal.
  // Looks ugly throughout calc hell, but it keeps the outputted calc formulas much cleaner.
  // Truncated parameter names (arr, zer, one, mor) chosen to help with multiline alignment.
  // function arrBuilder ({arr = [], ...args}): string {
  //   if (arr.length === 0) {
  //     return args['zer']
  //   } else if (arr.length === 1) {
  //     return args['one']
  //   } else if (arr.length > 1) {
  //     return args['mor']
  //   } else {
  //     return ''
  //   }
  // }

  // If a sum val exists, interpolate yes, else interpolate no (or nothing)
  function sumBuilder(sum, yes, no) {
    if (sum !== '') {
      return yes;
    } else {
      return no || '';
    }
  }

  // If a gutter is set, return the string of yes, else return string of no.
  function gutBuilder(gut, yes, no) {
    if (parseInt(gut, 10)) {
      return yes;
    } else {
      return no || '';
    }
  }

  // If a technique is set, find out which technique is being used and interpolate a string accordingly.
  function techBuilder(tech, nth, negativeMargin) {
    switch (tech) {
      case 'nth':
        return nth;

      case 'negative-margin':
        return negativeMargin;

      default:
        return '';
    }
  }

  // Aliases/caching for terser/faster formulas
  var val = sizes[pluck];
  var tech = opts.technique;
  var gut = parseInt(opts.gutters[0], 10) !== 0 ? opts.gutters[0] : 0;

  var valFixed = fixedsRegexp.test(val) ? true : false;
  var valFraction = fractionsRegexp.test(val) ? true : false;
  var valFr = frsRegexp.test(val) ? true : false;

  var numFixed = fixeds.length;
  var numFractions = fractions.length;
  var numFrs = frs.length;

  // If gutter, use first rounder, if no gutter, use second rounder. Alias for terser formulas.
  function rounder(gut) {
    if (gut !== 0) {
      return opts.rounders[0];
    } else {
      return opts.rounders[1];
    }
  }

  var settings = function settings() {
    console.log('\nsizes: ' + String(sizes) + '\n\nopts: ' + JSON.stringify(opts, null, 2) + '\n    ');
  };
  // settings()

  // Abandon hope! 👺

  // - ✔︎ fixed number only
  // Taken care of towards the top of this file.

  // - fraction(s) only
  if (valFraction && numFixed === 0 && numFrs === 0) {
    return result = formula(rounder(gut) + ' * ' + val + techBuilder(tech, gutBuilder(gut, ' - (' + gut + ' - ' + gut + ' * ' + val + ')'), gutBuilder(gut, ' - ' + gut)));
  }

  // - fraction(s) and fixed number(s) only
  if (valFraction && numFixed > 0 && numFrs === 0) {
    // return result = formula(`${rounder(gut)} * ${val}${techBuilder(tech, gutBuilder(gut, ` - (${gut} - ${gut} * ${val})`), gutBuilder(gut, ` - ${gut}`))}`)
  }

  return 'postcss-ant: How the hell did you get here? Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new';
};

module.exports = exports['default'];