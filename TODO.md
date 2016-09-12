# Todo

- Before tests
  - Add assets to npmignore.
  - Ensure dependencies are being installed. Maybe it's just my system but npm doesn't seem to be grabbing them.
  - Update netmag exercise repo.
  - Update ielove (with flexibility.js) and Boy (with CDN'd and local jQueries) then test on IE8. Test on various browsers to confirm the 99.99% stuff is still accurate. Check the Lost issue tracker to see exactly why they changed that.
  - Add example images and better examples to README docs.
- Tests
  - Create visual test generator that just accepts args.
  - If everything looks right, use values to create/lock AVA tests.
- Refactor with some sweet functional loving. Get some tips from better devs before starting the refactor. So embarrassed... In no particular order:
  - Consider pulling everything out to postcss-value-parser. All the regex crap everywhere is pretty silly. Just worried about performance of multiple walks.
  - Conditional regex needs to be `test` method.
  - Break modules out.
  - Break the math functions out to postcss plugins. postcss-sum, postcss-ratio are pretty specific, but pow could be wrapped up in something like postcss-math (which had access to all JS math).
  - Destructure variables everywhere -- at least in global options.
  - `namespace` could be dumbed down to '' and then just `${namespace}foooo` instead of the stupid RegExp objects everywhere.
  - Errors need to use the postcss error handling, or at least be abstracted into a function. It might be nice to abstract errors out to markdown or something.
  - All those switches and such could be wrapped up in a function.
  - Could probably consolidate a lot of the calc formulas into their own consts since a lot of them are repeated and just have a gutter or two tacked on the end.
  - Clean up repo. Migrate tinkering stuff out.
- Education/marketing
  - Rewrite docs.
    - API
    - Guides
    - Focus on the strengths of ant
      1. ratio grids
      2. clean/asymmetrical grid systems are breeze with generate-grid
      3. preprocessor looping lets users bespoke their own grid with whatever features they want
      4. custom sizing/positioning via pluck
    - Don't fight with flexbox. Mention its `flex-grow` looping weakness and the flexbugs, but don't focus on it. Use flexbox in most examples, but be sure to mention IE8 support.
  - Redesign site.
    - Homepage
    - Use React to make grid generator with custom selectors, feature checkboxes, etc. that outputs ant.css, ant.min.css, and a source map, while "saving" the user's settings via GET params. Add the GET url to the top of ant.css.
- Possible features
  - Add `size()` support to `generate-grid`. If 1/n fraction, set n to nth-child cycle. Anything else, no nth-child magic.
  - Don't require sizes() in generate-grid prop. `generate-grid: grid(...)` should cast base grid styles. If no sizes, require `grid()`.
  - Vertical and waffle to generate-grid under a `direction()` param after refactoring into declarer.
  - Create hard widths arg, so 1/5 of a container is 1/5 of that container (not whatever is leftover after subtracting fixed numbers). Slightly low priority as this might take a long time and doesn't seem to address a lot of use cases at first glance.
  - It might be nice to somehow split sizes lists on newlines. This would let users cast varying sizes-per-"row". Would require another param. Might only be useful for generate-grid loop.
```scss
$sizes:
  50px auto 50px
  200px auto 200px
;

// get(2) would return 100% - 100px and 100% - 400px respectively.
```
