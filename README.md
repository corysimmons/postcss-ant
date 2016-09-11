<img src="https://corysimmons.github.io/postcss-ant/img/postcss-ant-logo.svg" width="200">

**by Cory Simmons**

[![npm](https://img.shields.io/npm/v/postcss-ant.svg?maxAge=2592000)](https://www.npmjs.com/package/postcss-ant)
[![Dependencies](https://img.shields.io/david/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![devDependencies](https://img.shields.io/david/dev/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/LICENSE)

[![Gitter](https://badges.gitter.im/postcss-ant/Lobby.svg?style=flat-square)](https://gitter.im/postcss-ant/Lobby)

## Getting Started

### Installation

`npm i -D postcss-ant`

### CLI Usage

`postcss -w -u postcss-ant -o out.css in.css`

Generic PostCSS plugin usage can be found [here](https://github.com/postcss/postcss#usage).

### CLI Usage with Sass

- `node-sass -w in.scss out.css`
- `postcss -w -u postcss-ant -o final.css out.css`

### Examples

##### ant loop

```scss
// in.scss
.grid {
  ant:
    sizes(
      1/2
      1/4
      1/4
    )
    grid(negative-margin)
  ;
}
```

```scss
// final.css
.grid {
  display: flex;
  flex-wrap: wrap;
  margin-left: calc(-30px / 2);
  margin-right: calc(-30px / 2);
}

.grid > *  {
  margin-left: calc(30px / 2);
  margin-right: calc(30px / 2);
}

.grid > *:nth-child(3n + 1)  {
  width: calc(99.99% * 1/2 - 30px);
}

.grid > *:nth-child(3n + 2)  {
  width: calc(99.99% * 1/4 - 30px);
}

.grid > *:nth-child(3n + 3)  {
  width: calc(99.99% * 1/4 - 30px);
}
```

##### Plucking

```scss
// in.scss
.half-sans-100px {
  width: sizes(100px 1/2 1/2) pluck(2);
}
```

```scss
// final.css
.half-sans-100px {
  width: calc((99.99% - (100px + (30px * 1))) * 1/2 - (30px - 30px * 1/2));
}
```

#### Order of operations

Math methods are performed before anything else in this order:
1. `pow()`
1. `sum()`
1. `ratio()`

So you can use `pow()` inside of `sum()`, but not the other way around.

Sizes take precedence in this order:
1. fixed numbers
1. fractions
1. autos


- `sizes(1/2 100px auto) pluck(2)` would return `100px`.
- `sizes(1/2 100px auto) pluck(1)` would return `(100% - 100px) * 1/2` (half of the container sans the `100px`).
- `sizes(1/2 100px auto) pluck(3)` would return `100% - ((100% - 100px) * 1/2)` (whatever is leftover after half the container sans `100px`).

> Note: Returned `calc` formulas are gutter-aware/grid-friendly (it can get crazy), so don't take the pseudocode above literally.

### API

You can mix-and-match a bunch of these functions. ant has pretty friendly console errors to guide you.

##### size(*size*)

"Size" can be a lot of things:
- any valid CSS length
  - px, em, %, etc.
- fractions
- decimals
- `auto` keyword

Handy for when you want to cast a symmetrical fractional nth grid.

```scss
// in.scss
.thirds {
  width: size(1/3);
  margin-right: 30px;

  &:nth-child(3n + 3) {
    margin-right: 0;
  }
}
```

```scss
// final.css
.thirds {
  width: calc(99.99% * 1/3 - (30px - 30px * 1/3));
  margin-right: 30px;
}

.thirds:nth-child(3n + 3) {
  margin-right: 0;
}
```

##### sizes(*space separated sizes*)

`sizes()` can be used within the `ant` property by itself, but requires `pluck()` outside of the `ant` property.

`sizes()` is ant's required/primary method used to generate/return the `calc` formulas.

```scss
// in-1.scss
.grid {
  ant: sizes(100px 1/2 1/2);
}

// in-2.scss
.half-sans-100px {
  width: sizes(100px 1/2 1/2) pluck(2);
}
```

```scss
// final-1.css
.grid {
  display: flex;
  flex-wrap: wrap;
}

.grid > *  {
  margin-right: 30px;
}

.grid > *:nth-child(3n + 1)  {
  width: 100px;
}

.grid > *:nth-child(3n + 2)  {
  width: calc((99.99% - (100px + (30px * 1))) * 1/2 - (30px - 30px * 1/2));
}

.grid > *:nth-child(3n + 3)  {
  width: calc((99.99% - (100px + (30px * 1))) * 1/2 - (30px - 30px * 1/2));
  margin-right: 0;
}

// final-2.css
.half-sans-100px {
  width: calc((99.99% - (100px + (30px * 1))) * 1/2 - (30px - 30px * 1/2));
}
```
