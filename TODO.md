# Todo

- ant loop
  - add namespace support
  - clear: left on {length}n + (length + 1)
  - add vertical and waffle under a `direction()` param
- It might be nice to somehow split sizes lists on newlines. This would let users cast varying sizes-per-row. Would require another param. Might only be useful for ant loop.

```scss
$sizes:
  50px auto 50px
  200px auto 200px
;

// get(2) would return 100% - 100px and 100% - 400px respectively.
```

- Education/marketing
  - Take down wall-of-text old docs.
  - Add API to README.
  - Rewrite docs.
    - API
    - Guides
    - Focus on the strengths of ant
      1. ratio grids
      2. clean/asymmetrical grid systems are breeze with ant loop
      3. preprocessor looping lets users bespoke their own grid with whatever features they want
    - Don't fight with flexbox. Mention its `flex-grow` looping weakness and the flexbugs, but don't focus on it. Use flexbox in most examples, but be sure to mention IE8 support.
  - Redesign site.
    - Homepage
    - Use React to make grid generator with custom selectors, feature checkboxes, etc. that outputs ant.css, ant.min.css, and a source map.
- Refactor!!! Lower priority but god it needs some ES6 sweet functional loving. Get some tips from better devs before starting the refactor. So embarrassed...
  - Conditional regex needs to be `test` method.
  - Errors need to use the postcss error handling, or at least be abstracted into a function.
  - All those switches and such could be wrapped up in a function.
  - Could probably consolidate a lot of the calc formulas into their own consts since a lot of them are repeated and just have a gutter or two tacked on the end.
- Create hard widths arg, so 1/5 of a container is 1/5 of that container (not whatever is leftover after subtracting fixed numbers). Slightly low priority as this might take a long time and doesn't seem to address a lot of use cases at first glance.
- Add more visual tests for a plethora of sizes/params combinations. ant should be bulletproof.
- Add AVA tests. This is low priority because it will take forever and the visual test seems much more effective during initial development. Should add these before 1.0.0 though.
