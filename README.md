<img src="https://corysimmons.github.io/postcss-ant/img/postcss-ant-logo.svg" width="200">

A size-getting function that accepts fractions, decimals, fixed numbers, and everything in-between.

By the guy who made Jeet and Lost.

### Docs with Examples

[![Join the chat at https://gitter.im/postcss-ant/Lobby](https://badges.gitter.im/postcss-ant/Lobby.svg)](https://gitter.im/postcss-ant/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
