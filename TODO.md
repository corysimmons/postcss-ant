# Todo

- Education/marketing
  - Rewrite docs.
    - Take down whatever is up. Add empty landing page.
    - API
    - Guides
    - Focus on the strengths of ant
      1. ratio grids
      2. clean/asymmetrical grid systems are breeze with generate-grid
      3. preprocessor looping lets users bespoke their own grid with whatever features they want
    - Don't fight with flexbox. Mention its `flex-grow` looping weakness and the flexbugs, but don't focus on it. Use flexbox in most examples, but be sure to mention IE8 support.
  - Redesign site.
    - Homepage
    - Use React to make grid generator with custom selectors, feature checkboxes, etc. that outputs ant.css, ant.min.css, and a source map.
  - People who might be interested in this:
    - Jen Simmons (interested in layout)
    - Mark Boulton & the guy from his company who came up with Content-out Layouts (interested in ratio grids)
    - Rachel Andrew (interested in grid spec)
    - Chris Coyier (might want to backtrack on overthinking grids)
    - Jeffrey Way (liked Lost)
    - Scott Tolinski (liked Lost)
    - reddit (sometimes interested in some of my stuff -- as long as the website is pretty -- HackerNews don't care 'bout no grids)
    - People in Jeet/Lost issues asking for these features (my inspiration for this)
- Clean up repo. Migrate tinkering stuff out.
- Tests
  - Add visual tests first.
  - If everything looks right, use values to create AVA tests.
  - Should be in before 1.0.0.
  - Do refactoring sweeps before, after, and during.
- Refactor with some sweet functional loving. Get some tips from better devs before starting the refactor. So embarrassed... In no particular order:
  - Consider pulling everything out to postcss-value-parser. All the regex crap everywhere is pretty silly.
  - Conditional regex needs to be `test` method.
  - Break modules out.
  - Break the math functions out to postcss plugins. postcss-sum, postcss-ratio are pretty specific, but pow could be wrapped up in something like postcss-math (which had access to all JS math).
  - Destructure variables everywhere -- at least in global options.
  - `namespace` could be dumbed down to '' and then just `${namespace}foooo` instead of the stupid RegExp objects everywhere.
  - Errors need to use the postcss error handling, or at least be abstracted into a function. It might be nice to abstract errors out to markdown or something.
  - All those switches and such could be wrapped up in a function.
  - Could probably consolidate a lot of the calc formulas into their own consts since a lot of them are repeated and just have a gutter or two tacked on the end.
- Possible features
  - Don't require sizes() in generate-grid prop. `generate-grid: grid(...)` should cast a grid. if no sizes, require `grid()`.
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
