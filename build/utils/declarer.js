'use strict';

// Creates .selector:nth-child(3n + 1) ... (3n + 2) ... (3n + 3) ... rules after the current selector.
postcss.rule({
  selector: decl.parent.selector + ' > *:nth-child(' + setResults.length + 'n + ' + opts.pluck + ') '
}).moveAfter(decl.parent);

// Processes ant to get correct sizes.
decl.clone({
  prop: 'width',
  value: sizeResult
}).moveTo(decl.parent.next());