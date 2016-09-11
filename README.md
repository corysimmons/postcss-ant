<img src="https://corysimmons.github.io/postcss-ant/img/postcss-ant-logo.svg" width="200">

**by Cory Simmons**

[![npm](https://img.shields.io/npm/v/postcss-ant.svg?maxAge=2592000)](https://www.npmjs.com/package/postcss-ant)
[![Dependencies](https://img.shields.io/david/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![devDependencies](https://img.shields.io/david/dev/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/LICENSE)

[![Gitter](https://badges.gitter.im/postcss-ant/Lobby.svg?style=flat-square)](https://gitter.im/postcss-ant/Lobby)

> Note: The `ant` property will likely change to something like `cast` to avoid people namespacing with `ant-`, then having `ant-ant` littered everywhere. The API is still a bit unstable...

## Getting Started

### Installation

`npm i -D postcss-ant`

### CLI Usage

`postcss -w -u postcss-ant -o out.css in.css`

Using Webpack or something? Other PostCSS plugin usage instructions can be found [here](https://github.com/postcss/postcss#usage).

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

##### Bespoking asymmetrical ratio grid classes with preprocessor loops

```scss
// in.scss
$gutter: 15px;
$ratio: 1.618;
$sizes:
  ratio($ratio, 2)
  ratio($ratio, 6)
  ratio($ratio, 4)
;
$length: length($sizes);

.grid {
  display: flex;
  flex-wrap: wrap;
  margin-left: -$gutter / 2;
  margin-right: -$gutter / 2;

  > * {
    margin-left: $gutter / 2;
    margin-right: $gutter / 2;
  }
}

@for $i from 1 through $length {
  .column-#{$i} {
    width:
      sizes($sizes)
      gutter($gutter)
      pluck($i)
      grid(negative-margin)
    ;
  }
}
```

```scss
// final.css
.grid {
  display: flex;
  flex-wrap: wrap;
  margin-left: -7.5px;
  margin-right: -7.5px;
}

.grid > * {
  margin-left: 7.5px;
  margin-right: 7.5px;
}

.column-1 {
  width: calc(99.99% * 2.6179240000000004/27.41346045246828 - 15px);
}

.column-2 {
  width: calc(99.99% * 17.942010382692274/27.41346045246828 - 15px);
}

.column-3 {
  width: calc(99.99% * 6.853526069776002/27.41346045246828 - 15px);
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

## API

You can mix-and-match a bunch of these functions. ant has pretty friendly console errors to guide you.

### Global Settings

You can override global settings (except `@ant-namespace`) on a local setting level.

###### @ant-namespace

Define a namespace for your project. The `ant` property and all methods get this namespace.

It is up to you to define the separator like so: `@ant-namespace acme-;`

###### @ant-gutter

A global gutter setting. `30px` by default. Can be any valid CSS length. Can be overridden with `gutter()`.

###### @ant-grid

Defines the type of `calc` formulas to return results for. `nth` by default. Can be `nth` or `negative-margin`. Can be overridden with `grid()`.

###### @ant-support

Defines if you want to support older browsers. `flexbox` by default. Can be `flexbox` or `float`. Can be overridden with `support()`.

##### size(*size*)

*size* can be a lot of things:
- any valid CSS length
  - px, em, %, etc.
- fractions
- decimals
- `auto` keyword

Handy for when you want to cast a symmetrical fractional grid.

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

`sizes()` is ant's required/primary method used to generate/return the `calc` formulas.

`sizes()` can be used within the `ant` property by itself, but requires `pluck()` outside of the `ant` property.

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
