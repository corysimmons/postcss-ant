<img src="https://corysimmons.github.io/postcss-ant/img/postcss-ant-logo.svg" width="200">

**by Cory Simmons**

[![npm](https://img.shields.io/npm/v/postcss-ant.svg?maxAge=2592000)](https://www.npmjs.com/package/postcss-ant)
[![Dependencies](https://img.shields.io/david/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![devDependencies](https://img.shields.io/david/dev/corysimmons/postcss-ant.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/package.json)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/corysimmons/postcss-ant/blob/master/LICENSE)

[![Gitter](https://badges.gitter.im/postcss-ant/Lobby.svg?style=flat-square)](https://gitter.im/postcss-ant/Lobby)

### Installation

`npm i -D postcss-ant`

### CLI Usage

`postcss -w -u postcss-ant -o out.css in.css`

Generic PostCSS plugin usage can be found [here](https://github.com/postcss/postcss#usage).

### CLI Usage with Sass

- `node-sass -w in.scss out.css`
- `postcss -w -u postcss-ant -o final.css out.css`

### API

You can mix-and-match a bunch of these functions. ant has pretty friendly console errors to guide you.

##### size(size)

"Size" can be a lot of things:
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

##### sizes(space separated sizes)

`sizes()` can be used within the `ant` property by itself. 

```scss
.
```
