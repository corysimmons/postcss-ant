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

### API

`ant(list of sizes, [gutter], [grid type])[1-based index]`

### Global Settings

Globals are defined as atRules (e.g. `@import` is an atRule) and should go at the top of the stylesheet.

Global settings can also be overridden within `ant()` functions (refer to the API above).

- `@ant-gutter [valid CSS length];`
  - Defaults to `30px`.
  - Example to get rid of gutters: `@ant-gutter 0;`
- `@ant-type [nth | negative-margin]`
  - Defaults to `nth`.

### Examples

Check out the docs website for a more thorough explanation of each of these techniques.

##### Basic Usage

This contrived example simply demonstrates how to pass sizes and fetch them with the 1-based index.

```scss
div {
  width: ant(100px 200px 300px)[2]; // returns 200px
}
```

##### Creating a simple grid by fraction

The default

```scss
.third {
  float: left;
  width: ant(1/3)[1]; // returns calc(100% * 1/3 - (30px - 30px * 1/3))
  margin-right: 30px; // gutter

  &:nth-child(3n) {
    margin-right: 0; // remove gutter on last element of each row
  }
}
```

##### Asymmetrical grid with flexbox and preprocessor looping

```scss
.grid {
  display: flex;
  flex-wrap: wrap;
}

.column {
  $sizes: 1/10 2/10 3/10 4/10;

  @for $i in 1 through 4 {
    &:nth-child(4n + $i) {
      width: ant($sizes)[$i];
    }
  }

  margin-right: 30px;

  &:nth-child(4n) {
    margin-right: 0;
  }
}
```

## Todo

- Add `offset` and `move` args.
- .editorconfig
- Rewrite docs.
  - Focus on the strengths of ant (preprocessor looping makes defining a grid really nice).
  - Provide example of a vs. flexbox alone methodology to prove speed of development.
  - Don't fight with flexbox. Mention it's `flex-grow` looping weakness and the flexbugs, but don't focus on it. Use flexbox in most examples, but be sure to mention IE8 support.
  - Make some videos!
- Refactor.
  - All those switches and such could be wrapped up in a function.
  - Could probably consolidate a lot of the calc formulas into their own consts since a lot of them are repeated and just have a gutter or two tacked on the end.
  - It'd be nice to use posthtml or something to generate the markup from a list of sizes. Low priority.
- More error handling for when users try to use incorrect arg combinations. For instance, `negative-margin, offset-big` shouldn't work -- it should only accept `offset`.
- Create hard widths arg, so 1/5 of a container is 1/5 of that container (not whatever is leftover after subtracting fixed numbers). Slightly low priority as this might take forever.
- Add more visual tests for a plethora of sizes/params combinations. ant should be bulletproof.
- Add AVA tests. This is low priority because it will take forever and the visual test seems much more effective during initial development. Should add these before 1.0.0 though.
