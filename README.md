<img src="https://corysimmons.github.io/postcss-ant/img/postcss-ant-logo.svg" width="200">

A size-getting function that accepts fractions, decimals, fixed numbers, and everything in-between.

By the guy who made Jeet and Lost.

[![npm](https://img.shields.io/npm/v/postcss-ant.svg?maxAge=2592000)](https://www.npmjs.com/package/postcss-ant)
[![Dependencies](https://img.shields.io/david/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![devDependencies](https://img.shields.io/david/dev/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/LICENSE)

[![Gitter](https://badges.gitter.im/postcss-ant/Lobby.svg?style=flat-square)](https://gitter.im/postcss-ant/Lobby)

### Docs with Examples

https://corysimmons.github.io/postcss-ant

### Installation

`npm i -D postcss-ant`

### Usage

`postcss -u postcss-ant -o out.css in.css`

Using Gulp or something? Read about some other integrations on the [docs website](https://corysimmons.github.io/postcss-ant/usage).

Generic PostCSS plugin usage can be found [here](https://github.com/postcss/postcss#usage).


## Todo

- ant looper
  - add namespace support
  - clear: left on {length}n + (length + 1)
  - add vertical and waffle under a `direction()` param
  - add `ratio()` support
- This needs more thought and may only be useful for the `ant` prop, but it'd be really nice to somehow split sizes lists on newlines, example:

```scss
$sizes:
  1px auto 1px
  2px auto 2px
;

// get(2) would return 100% - 2px and 100% - 4px respectively.
```

- Rewrite docs.
  - Take down old docs.
  - Focus on the strengths of ant (preprocessor looping makes defining a grid really nice, and bespoking grid systems a breeze).
  - Provide example of a vs. flexbox alone methodology to prove speed of development.
  - Don't fight with flexbox. Mention its `flex-grow` looping weakness and the flexbugs, but don't focus on it. Use flexbox in most examples, but be sure to mention IE8 support.
  - Make README a bit beefier.
  - Use React to make grid generator with custom selectors, feature checkboxes, etc. that outputs ant-grid.css, ant-grid.min.css, and a source map.
  - Make some videos!
- Refactor. Lower priority. Get some tips from better devs before starting the refactor.
  - Conditional regex can probably be done better with JS's `test` method or something.
  - Errors could definitely be refactored.
  - All those switches and such could be wrapped up in a function.
  - Could probably consolidate a lot of the calc formulas into their own consts since a lot of them are repeated and just have a gutter or two tacked on the end.
- Create hard widths arg, so 1/5 of a container is 1/5 of that container (not whatever is leftover after subtracting fixed numbers). Slightly low priority as this might take a long time.
- Add more visual tests for a plethora of sizes/params combinations. ant should be bulletproof.
- Add AVA tests. This is low priority because it will take forever and the visual test seems much more effective during initial development. Should add these before 1.0.0 though.
