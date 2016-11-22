<h3 align="center">postcss-ant</h3>

<p align="center">
  <sup>Layouts made fun.</sup>
</p>

<p align="center">
  <img src=".github/img/postcss-ant-logo.png" alt="Cartoon ant with red cape." width="320">
</p>

<p align="center">
  <a href="https://gitter.im/postcss-ant/Lobby" target="_blank">
    <img src="https://badges.gitter.im/postcss-ant/Lobby.svg?style=flat-square" alt="Gitter chat badge.">
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/postcss-ant" target="_blank">
    <img src="https://img.shields.io/npm/v/postcss-ant.svg?maxAge=2592000" alt="npm version badge.">
  </a>
  <a href="https://github.com/corysimmons/postcss-ant/blob/master/package.json" target="_blank">
    <img src="https://img.shields.io/david/dev/corysimmons/postcss-ant.svg?maxAge=2592000" alt="Dev dependencies status badge.">
  </a>
  <a href="https://github.com/corysimmons/postcss-ant/blob/master/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000" alt="MIT license badge.">
  </a>
</p>

# Table of Contents

<!-- toc -->

- [Play with postcss-ant Right Now](#play-with-postcss-ant-right-now)
- [Installation](#installation)
- [Usage](#usage)
  * [postcss-cli and CSS](#postcss-cli-and-css)
  * [postcss-cli and Sass](#postcss-cli-and-sass)
  * [postcss-cli and Stylus](#postcss-cli-and-stylus)
- [FAQ](#faq)
  * [Another grid?!](#another-grid)
  * [But Flexbox?!](#but-flexbox)
  * [What About Grid Spec?!](#what-about-grid-spec)
- [Global Settings](#global-settings)
  * [@ant-namespace](#ant-namespace)
  * [@ant-gutters](#ant-gutters)
  * [@ant-support](#ant-support)
  * [@ant-technique](#ant-technique)
  * [@ant-children](#ant-children)
  * [@ant-rounders](#ant-rounders)
- [Local Settings](#local-settings)
- [Local API](#local-api)
  * [`sizes()` and `pluck()`](#sizes-and-pluck)
  * [Order of Operations](#order-of-operations)
  * [`generate-grid` (or `gg`)](#generate-grid-or-gg)
  * [`ratio()`](#ratio)
  * [`bump()`](#bump)
- [Bespoking Grids](#bespoking-grids)
  * [Pre-processor Looping to Create Ratio Grid Classes](#pre-processor-looping-to-create-ratio-grid-classes)
  * [Create Your Own Attribute-driven Grid](#create-your-own-attribute-driven-grid)
- [Helpers](#helpers)
- [Browser Support](#browser-support)
- [Wishlist](#wishlist)
- [Thanks](#thanks)
- [Contributing](#contributing)

<!-- tocstop -->

---

<h2 align="center">Author's Note</h2>

I know a thing or two about grid systems and layouts in CSS. I made [Jeet](http://jeet.gs) and [Lost](http://lostgrid.org). They each took about a week to make.

postcss-ant took me months to code and years of community feedback to learn exactly _what_ to make.

CSS grids are bloaty (markup and CSS) and boring (`1/n` everything). Flexbox was a slight improvement, but it's still bloaty (markup) and unpredictable (bugs and hard to reason about).

Grid Spec is nice but won't be production-ready for a year (even if it does launch in "early 2017") -- unless you exclusively support modern, desktop, browsers (Edge+).

postcss-ant is like Grid Spec (myriad of units/sizes available) but can't do the 2D layout thing.

It's better in some ways: real fractions, ratio sizing, ability to fetch specific sizes to be used anywhere).

Use Grid Spec if you're one of those _"cutting-edge"_ people. Use postcss-ant for at least the next several months if you care about delivering a solid experience to the largest audience possible (aka: you actually make popular/profitable websites).

Actually, postcss-ant's API is tiny; it'll save you a ton of layout work; it will expand your mind to new design paradigms; and you can use it alongside Grid Spec when the time is right. Learn/use it regardless.

Or don't. I'm not your mom. 🐒

---

## Play with postcss-ant Right Now

- Clone this repo
- `npm install node-sass` (Sass isn't included with the playground as it'd make the `npm install` for postcss-ant take forever)
- `npm install`
- `npm run playground`
- Edit `playground/index.html` and `playground/css/style.scss`

[Back to top ↑](#table-of-contents)

## Installation

`npm install postcss-ant`

[Back to top ↑](#table-of-contents)

## Usage

You can use postcss-ant anywhere you can use PostCSS: CLI, Webpack, Gulp, Rollup, Grunt, etc.

I 💖 CLI so below are instructions for CLI. Just ping me via Issues if you'd like a boilerplate integration with a specific tool -- we can start a Wiki page for them.

### postcss-cli and CSS

- `npm install postcss-cli`
- `node_modules/.bin/postcss -w -u postcss-ant -o style.post.css style.css`

```html
<section>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</section>
```

```scss
// style.css
section {
  generate-grid: columns(100px 1/3 auto);
}
```

![](.github/img/simple-example.png)

### postcss-cli and Sass

Docs are in Sass because Sass is more popular.

- `npm install postcss-cli node-sass`
- `node_modules/.bin/node-sass -w style.scss style.css`
- `node_modules/.bin/postcss -w -u postcss-ant -o style.post.css style.css` (in another terminal tab)

### postcss-cli and Stylus

- `npm install postcss-cli stylus`
- `node_modules/.bin/stylus -w style.styl`
- `node_modules/.bin/postcss -w -u postcss-ant -o style.post.css style.css` (in another new terminal tab)

> Stylus' syntax doesn't mesh well with a lot of PostCSS plugins. postcss-ant's API was specifically developed to be very friendly with preprecessors, but just keep in mind if you break methods onto new lines, Stylus will throw errors. To remedy this, just add a `\` before each line break (at the end of each line).

[Back to top ↑](#table-of-contents)

## FAQ

### Another grid?!

I feel ya... But don't close that tab. This tool is vastly different than anything out there.

postcss-ant is a size-getting function capable of returning `%` sizes in the form of a `calc` formula. This means you can use it anywhere you could ever need a size. Have a layout itch? postcss-ant can scratch it.

**Size-getting Example:**

This will horizontally center a `300px` wide element.

```scss
div {
  width: 300px;
  margin-left:
    sizes(auto 300px auto)
    pluck(1) // targets that first `auto`
    bump(30px); // adds a gutter to help out
}
```

![](.github/img/center.png)

Obviously there are better ways to center elements. This is just an example -- off the top of my head -- which should show how flexible size-getting can be. You can think of almost any type of size you could ever need, and postcss-ant can return it.

Since grid generation happens to be such a common use-case, postcss-ant has a `generate-grid` helper property (aliased as `gg`) that can cast low-bloat/powerful grids with an easy API.

**Grid Example:**

```html
<section>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
</section>
```

```scss
section {
  generate-grid:
    columns(1/3 auto 100px, 1/2 1/2)
    rows(150px 150px 150px, 200px 200px);
}
```

- The first row will have three columns of sizes: `1/3`, `auto`, and `100px` (in that order). Each of those elements will be `150px` tall (as defined in the `rows()` method).
- The second row will have two `1/2` columns that are each `200px` tall.
- These rows will repeat indefinitely. Every odd row will be `150px` tall with `1/3 auto 100px` columns. Every even row will be `200px` tall with `1/2 1/2` columns.

![](.github/img/1-3-auto-100.png)

If you can wrap your head around `generate-grid: columns()` then that's all you really need to get rolling with postcss-ant.

### But Flexbox?!

Flexbox is a bad grid replacement since `flex-grow` doesn't take gutters into account when spanning multiple columns -- unless you're making those padding-based grids that require a significant amount of markup bloat. Even then, it would crap-the-bed if the last element was that `auto` (or `flex-grow: 1` in a flexbox approach). It'd stretch the rest of the row (not what you wanted).

Flexbox's strength isn't as a grid replacement -- since it often throws away the concept of "lining things up" that made grids popular in the first place. Flexbox's strengths are:

- Getting rid of `clearfix` bloat.
- Provides predictable alignment rules with one less `<div>`.
- Somewhat simplifies source ordering.

postcss-ant's `generate-grid` property defaults to flexbox for those reasons, but in most "flexbox grid systems" there is very little flexbox is actually bringing to the table.

### What About Grid Spec?!

Grid Spec won't be out for a few months. It will work in many cutting-edge browsers, but will likely have many bugs since the only people to play with it are a handful of developers since they made the decision to hide it behind a browser flag. It will just straight-up break websites in browsers without support (several percentage of users for a few years).

You should learn Grid Spec after it launches -- and bugs have been identified & have workarounds. Many of its features are very nice, and its API is extremely terse. postcss-ant shares a lot of Grid Spec's most useful features but **postcss-ant works in IE9 (IE8 with polyfills)**.

postcss-ant can also be used alongside Grid Spec with for things like real fractions and easy ratio sizing.

There are 3 categories of layout tools. postcss-ant, Grid Spec, and everything else.

If something in this comparison seems unfair, please open an Issue or chat with me on Gitter about it and I'll resolve it.

Accurate information > whatever bias might be blinding me.

|| postcss-ant | Grid Spec | Everything else
:-:|:-:|:-:|:-:
**Fractions** | ✔ | ❌ | Jeet<br>Lost
**Fixed units and fractions** | ✔ | ❌ | ❌
**Fixed units and auto** | ✔ | ✔ | Flexbox
**Fixed units, fractions, and auto** | ✔ | ❌ | ❌
**Size-getting function** | ✔ | ❌ | Susy<br>Jeet
**2D layouts** | ❌ | ✔* | ❌
**Seamless source ordering** | ❌ | ✔ | Flexbox
**Composable API** | ✔ | ✔ | Flexbox<br>Susy
**Easy ratios** | ✔ | ❌ | ❌

\****2D layouts are nothing to sneeze at and Grid Spec does this with minimal markup. This is the biggest reason to learn Grid Spec.***

> **Note:** Grid Spec's free-space units (`fr`) can "span" (e.g. `2fr` would span twice as much as `1fr`). I can port this functionality over, but I'm extremely poor _(yay open source!)_ so it's low on my todo list. In the meantime, postcss-ant uses the `auto` keyword which is equivalent to `1fr` but cannot span -- you can nest containers to achieve a similar effect if you really need it.

> **Fun Fact:** Grid Spec's API was developed independently of postcss-ant's. Any similarities with how size setting works (e.g. fixed takes precedence over `fr`) is completely by coincidence and a testament to how good of an idea these new ideas about sizing are.

[Back to top ↑](#table-of-contents)

## Global Settings

As per PostCSS plugin convention, globals are set as atRules (like an `@import`) and should be defined at the top of your stylesheet.

### @ant-namespace

**Default:** `''`

By default, nothing in postcss-ant is namespaced (except for these global settings).

Sometimes namespacing is overrated. PostCSS will process stuff before the browser ever gets ahold of it, so the only threat of collision is if a preprocessor collides. I've taken care not to collide with any existing preprocessor functions, and development on preprocessors has significantly slowed down these past few years, so I don't expect too many new API changes to be introduced.

If this is something that concerns you, you can modify this on a global level.

Every single postcss-ant method and helper will get prefixed with your namespace.

```scss
@ant-namespace ant-;

div {
  width: ant-sizes(1/4 auto) ant-pluck(2);
}

section {
  ant-gg: ant-columns(1/4 1/2 1/4);
}
```

### @ant-gutters

**Default:** `30px, 30px`

postcss-ant offers two gutter settings. One is for the space between columns, the other is for the space between rows. If you only specify a singular gutter (e.g. `@ant-gutter`), it will set both.

```scss
@ant-gutters 15px, 45px;

section {
  gg:
    columns(1/2 1/2, 1/3 1/3 1/3)
    rows(100px 100px, 200px 200px 200px);
}
```

### @ant-support

**Default:** `flexbox`

Flexbox is the default since it's supported in most modern browsers and offers bloat-cleanup, equal-height columns, and syntactic sugar for things like alignment/source ordering -- but if you need to support older browsers, postcss-ant also offers a `float` option that will use floats instead of flexbox to support IE9 (and IE8 with a few polyfills).

### @ant-technique

**Default:** `nth`

There are multiple ways to create CSS grids.

- `nth`: You can say "every element should have a gutter except the last element in a row". postcss-ant defaults to `nth` because it makes layout construction cleaner.
  - **Pros:** Very light markup.
  - **Cons:** You need to know how many elements will go in each row.
- `negative-margin`: The containing element has a negative-margin. Elements within that container will get a margin on their sides. These are particularly good for photo galleries or somewhere you're confident will have varying sized columns randomly on each row.
  - **Pros:** You don't need to know how many elements per row.
  - **Cons:** More markup -- especially when nesting.

> **Tip:** You can mimic padding-based layouts (like Bootstrap and the plethora of flexbox grids out there) simply by removing gutters. These grids work well with flexbox source ordering but require a significant amount of additional markup.

### @ant-children

**Default:** `nth-child`

`generate-grid` operates by assigning an nth selector to immediate children. By default, this is `nth-child`, but you can change this to `nth-of-type` if you prefer that style.

### @ant-rounders

**Default:** `99.99%, 99.999999%`

Sub-pixel rounding is a big problem with fluid grids. A lot of browsers implement their own way to round sub-pixels. These discrepancies are different if you're using gutters (the first number), and if you're not using gutters (the second number). They're also exacerbated when nesting. You typically won't notice this, but if the specific layouts you are creating cause a missing pixel here and there, you can modify it here.

It's probably best to leave this global setting alone, and modify rounders on a local level.

Like `@ant-gutters`, this setting offers a singular (e.g. `@ant-rounder`) that will set both -- although this is strongly discouraged since the pixel rounding between gutter and gutter-less sizes is significant.

[Back to top ↑](#table-of-contents)

## Local Settings

Excluding namespace, **all of postcss-ant's global settings can be set on a local level**. For instance, you can set `50px` gutters on a global level, and still have the ability to modify the gutter on specific grids throughout your project.

postcss-ant's API for this was intentionally designed to be very composable. That is, you tack these settings on where you deem fit. Think of these like chainable functions in jQuery.

Local settings work alongside `generate-grid` and/or `sizes() pluck()`.

**Example:**

```scss
section {
  generate-grid:
    columns(1/4 1/2 1/4)
    gutter(0)
    technique(negative-margin)
    support(float)
  ;
}
```

[Back to top ↑](#table-of-contents)

## Local API

The meat of postcss-ant is wrapped up in `sizes() pluck()` and `generate-grid:`. These are to be used to fetch specific sizes and to generate columns/rows, respectively. postcss-ant also provides a `bump()` helper for nudging things exactly where you might need them.

### `sizes()` and `pluck()`

To return a single size, postcss-ant needs to know what sizes you're using. For instance, to get whatever is left over after `100px`, you'd need to let postcss-ant know about that `100px`.

So you pass a set of space-separated sizes like so: `width: sizes(100px auto);`.

But postcss-ant still doesn't know what value you're looking for out of the two, so you **need** to specify a `pluck()` with `sizes()`.

- `width: sizes(100px auto) pluck(1);` returns `100px`.
- `width: sizes(100px auto) pluck(2);` returns `calc((99.99% - (100px) - ((1 + 1 - 1) * 30px)) / 1)`. It looks nasty, but it works. That `calc` formula will return a `%` of whatever is left over.

> **Tip:** `postcss-calc` can clean it up _a bit_ if it offends your sensibilities. I'd appreciate a PR to clean these up, but I just don't have time/desire to revisit them right now for purely aesthetic reasons.

![](.github/img/100px-auto.png)

You can think of `sizes()` like an array and `pluck()` like the index. Keep in mind that `pluck()` starts at 1 whereas most array indexes start at 0. This is to match up with how CSS' `nth` selectors are numbered -- which makes it work very nicely with preprocessor looping.

```scss
div {
  width: sizes(100px 200px 300px) pluck(2); // returns the second size: 200px
}
```

**A Non-contrived Example:**

```html
<section>
  <aside>1</aside>
  <main>2</main>
</section>
```

```scss
section {
  display: flex;
}

aside {
  width: sizes(300px auto) pluck(1);
}

main {
  width: sizes(300px auto) pluck(2);
}
```

![](.github/img/300px-auto.png)

### Order of Operations

You can use any combination of fixed numbers (**any** valid CSS length), fractions, and `auto` keyword(s).

The order of operations is `fixed -> fractions -> autos`.

- `sizes(100px 1/3 auto) pluck(1)` returns `100px`.
- `sizes(100px 1/3 auto) pluck(2)` returns `1/3` of what's left over _after_ `100px` is subtracted.
- `sizes(100px 1/3 auto) pluck(3)` returns of what's left over _after_ `100px` _and_ that `1/3` is subtracted.

![](.github/img/100px-1-3-auto.png)

The order of the sizes you define isn't important. Fixed numbers will always take priority, then fractions, then `auto`s.

### `generate-grid` (or `gg`)

Aliased as `gg` since you'll likely be using this frequently.

`generate-grid` accepts `columns()` and `rows()`.

In turn, `columns()` and `rows()` accept a comma-separated, space-separated set of sizes.

Each space-separated list of sizes is referred to as a **"size set"**. So in `columns(1px 2px)`, the `1px 2px` would be a size set. In `columns(1px 2px, 3px 4px)`, the size sets would be `1px 2px` and `3px 4px`.

In `columns()`, each size set will create a row of elements of those sizes. For instance, `columns(1/2 1/2)` will create two half-sized columns and automatically repeat onto new rows.

Each comma-separation in `columns()` will create a new row. So `columns(1/2 1/2, 1/3 1/3 1/3)` would create two rows. The first row would have two `1/2` sized columns (since you defined two sizes), and the second row would have three `1/3` sized columns (since you defined three sizes).

`rows()` pair with each size defined in `columns()` and will adjust those columns' heights.

Words are hard and confusing... Here's an example.

**Generate Grid Example:**

```scss
// Two rows. First row 100px-tall thirds. Second row 200px-tall halves.
section {
  gg:
    columns(
      1/3 1/3 1/3,
      1/2 1/2
    )
    rows(
      100px 100px 100px,
      200px 200px
    );
}
```

![](.github/img/1-3-1-3-1-3-1-2-1-2.png)

Notice how the first row is `100px` tall and the second row is `200px` tall. `rows()` is doing that.

You don't have to specify `rows()` and typically won't need to.

### `ratio()`

postcss-ant introduces easy, real ratio-sizing. This has never been done before and is a complete paradigm shift from the traditional `1/n` grids we've grown accustom to.

We can pass `ratio()` to `sizes()` or `columns()`/`rows()`.

**Ratio Example:**

We'll break these out to their own lines for readability.

```html
<section>
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
</section>
```

We'll use the golden ratio since it's well-known, but any ratio will work so play around with them to see what looks best to you.

```scss
section {
  $gold: 1.618; // the golden ratio

  gg:
    columns(
      ratio($gold, 1)
      ratio($gold, 2)
      ratio($gold, 3)
      ratio($gold, 4)
      ratio($gold, 5)
    )
  ;
}
```

![](.github/img/ratio-grid.png)

You can reorder those and combine them with fixed units.

> **Warning:** Fractions and `auto`s won't work in this context since `ratio()` operates on remaining space.

```scss
section {
  $rat: 2.75;

  gg:
    columns(
      340px
      ratio($rat, 2)
      ratio($rat, 1)
    )
  ;
}
```

![](.github/img/ratio-with-fixed.png)

How does this work? `ratio()` accepts the same arguments as JavaScript's `pow()` function: `base` and `exponent`. These are how we create the numerators of each fraction `ratio()` outputs.

When postcss-ant encounters one of these `ratio()` keywords, it will look for others within the same declaration and combine them all to create the denominator for each fraction.

**Contrived Ratio Example:**

```scss
div {
  @for $i from 1 through 3 {
    &:nth-child(#{$i}) {
      width:
        sizes(
          ratio(2, 1) // 2
          ratio(2, 2) // 4
          ratio(2, 3) // 8
                      // 2 + 4 + 8 = 14
                      // 2/14... 4/14... 8/14...
        )
        pluck($i)
      ;
    }
  }
}
```

```css
div:nth-child(1) {
  width: calc(99.99% * 2/14 - (30px - 30px * 2/14));
}

div:nth-child(2) {
  width: calc(99.99% * 4/14 - (30px - 30px * 4/14));
}

div:nth-child(3) {
  width: calc(99.99% * 8/14 - (30px - 30px * 8/14));
}
```

You probably won't need to use preprocessor looping with `sizes()` and `pluck()` unless you're bespoking grid classes (or just having fun). So let's look at how `ratio()` can be used with `generate-grid`.

**`generate-grid` Golden Ratio Example:**

Let's create a page layout with a content area and sidebar.

```html
<section>
  <main>1</main>
  <aside>2</aside>
</section>
```

We can scale this with the traditional `1/n` type grids... **or** we can do something unique/beautiful and use ratios. We're still creating proportional designs. But since they scale in size, they look more interesting.

```scss
$golden: 1.618;

section {
  generate-grid:
    columns(
      ratio($golden, 3)
      ratio($golden, 1)
    )
  ;
}
```

Take a second to notice how insane the fractions are for this sort of simple thing.

This is the beauty of postcss-ant. It's a very easy-to-use size-calculator on crack.

```css
/* ... */
section > *:nth-child(2n + 1) {
  width: calc(99.99% * 4.235801032000001/5.853801032000002 - (30px - 30px * 4.235801032000001/5.853801032000002));
}

section > *:nth-child(2n + 2) {
  width: calc(99.99% * 1.618/5.853801032000002 - (30px - 30px * 1.618/5.853801032000002));
}
/* ... */
```

![](.github/img/simple-golden-ratio.png)

### `bump()`

The final local-only method postcss-ant offers is `bump()`. Every now and then you'll try to generate a specific size, but it will be off by a gutter, or 1.5x gutter, or just a few pixels, or _something!_ `bump()` offers you a way to nudge elements exactly where you need them.

`bump()` accepts anything you'd like to tack onto the end of the `calc` formula postcss-ant returns.

`bump()` accepts any valid `calc` expression. If no operator (e.g. `+`, `-`, `*`, `/`) is specified at the beginning of an expression, `bump()` defaults to addition.

**Example:**

```html
<section>
  <div>1</div>
  <div class="move-right">2</div>
  <div>3</div>
</section>
```

```scss
section {
  generate-grid: columns(1/3 1/3 1/3);
}

.move-right {
  position: relative;
  left:
    sizes(1/3)
    pluck(1)

    // We're still off by a gutter, so let's add that gutter to it.
    bump(30px)
  ;
}
```

[Back to top ↑](#table-of-contents)

## Bespoking Grids

The ability to create/use classes -- especially amongst a larger team, or if you're making a CSS framework -- is _very_ handy and a huge reason grids like Bootstrap's are still in use.

postcss-ant + preprocessor looping accomodates this need quite nicely.

### Pre-processor Looping to Create Ratio Grid Classes

You might be used to indexes being 0-based. `pluck()` is 1-based (starts at 1). This parallels with how the W3C implemented `nth` selectors so that it's very easy to create preprocessor loops that pluck the same index as the element they are affecting.

This means with a bit of preprocessor looping knowledge you can easily bespoke grid classes that were never achievable before. For instance, golden ratio grid classes.

**Preprocessor Looping Example:**

```html
<div class="ratio-1">1</div>
<div class="ratio-2">2</div>
<div class="ratio-3">3</div>
```

```scss
$golden: 1.618;
$sizes:
  ratio($golden, 1)
  ratio($golden, 2)
  ratio($golden, 3);

@for $i from 1 through length($sizes) {
  .ratio-#{$i} {
    width: sizes($sizes) pluck($i);
  }
}
```

```css
.ratio-1 {
  width: calc(99.99% * 1.618/8.471725032000002 - (30px - 30px * 1.618/8.471725032000002));
}

.ratio-2 {
  width: calc(99.99% * 2.6179240000000004/8.471725032000002 - (30px - 30px * 2.6179240000000004/8.471725032000002));
}

.ratio-3 {
  width: calc(99.99% * 4.235801032000001/8.471725032000002 - (30px - 30px * 4.235801032000001/8.471725032000002));
}
```

These are only the sizes, you'd need to add a few custom grid classes like so:

```html
<section class="ratio-grid">
  <div class="ratio-1">1</div>
  <div class="ratio-2">2</div>
  <div class="ratio-3">3</div>
</section>
```

```scss
.ratio-grid {
  display: flex;
  flex-wrap: wrap;

  > * {
    margin-right: 30px;

    &:last-child {
      margin-right: 0;
    }
  }
}
```

![](.github/img/ratio-grid-classes.png)

### Create Your Own Attribute-driven Grid

Combining `sizes()` and `pluck()` with looping opens up a world of interesting approaches. Let's create a grid that is driven by very readable attributes:

```html
<section data-grid="columns(4)">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</section>
```

```scss
// style.scss
[data-grid] {
  display: flex;
  flex-wrap: wrap;

  > * {
    margin-right: 30px;

    &:last-child {
      margin-right: 0;
    }
  }
}

$columns: 12;

@for $i from 1 through $columns {
  [data-grid*="columns(#{$i})"] {
    > * {
      width: sizes(#{$i}/$columns) pluck(1);
    }
  }
}
```

```css
/* style.css */
[data-grid] {
  display: flex;
  flex-wrap: wrap;
}

[data-grid] > * {
  margin-right: 30px;
}

[data-grid] > *:last-child {
  margin-right: 0;
}

[data-grid*="columns(1)"] > * {
  width: sizes(1/12) pluck(1);
}

[data-grid*="columns(2)"] > * {
  width: sizes(2/12) pluck(1);
}

[data-grid*="columns(3)"] > * {
  width: sizes(3/12) pluck(1);
}
/* ... */
```

```css
/* style.post.css */
[data-grid] {
  display: flex;
  flex-wrap: wrap;
}

[data-grid] > * {
  margin-right: 30px;
}

[data-grid] > *:last-child {
  margin-right: 0;
}

[data-grid*="columns(1)"] > * {
  width: calc(99.99% * 1/12 - (30px - 30px * 1/12));
}

[data-grid*="columns(2)"] > * {
  width: calc(99.99% * 2/12 - (30px - 30px * 2/12));
}

[data-grid*="columns(3)"] > * {
  width: calc(99.99% * 3/12 - (30px - 30px * 3/12));
}
/* ... */
```

![](.github/img/thirds.png)

> This particular example isn't very flexible, but I've made some pretty cool/flexible attribute grids using postcss-ant in the past.

> The point of this section isn't to hand you a selector grid -- that's not the point of postcss-ant at all -- but rather to get you pumped about playing with loops and postcss-ant to make/use/market your own grids. Please ping me in Gitter or via Issues if you make something or need help in making something.

> I'd love to see if the community can come up with some really awesome selector grid. 😻

[Back to top ↑](#table-of-contents)

## Helpers

You've already seen the `generate-grid` helper. There are a few other helpers as well:

- `pow(base, exponent)` - Operates just like the JavaScript `pow()` function. It returns the power of a number.
- `sum(list of numbers)` - Adds a list of numbers together.

They're combined to create `ratio()`. I haven't found a lot of use for these helpers outside of that, but maybe you will.

postcss-ant's codebase is very flexible, so we can add helpers as needed. Let me know if you think of any other features that might make cool additions to postcss-ant.

[Back to top ↑](#table-of-contents)

## Browser Support

Anywhere [`calc`](http://caniuse.com/#feat=calc) is supported. IE9+ without any help.

IE8+ and Android 4.0.3+ with polyfills (like [ielove](https://github.com/corysimmons/ielove)).

[Back to top ↑](#table-of-contents)

## Wishlist

postcss-ant's API was developed to be extensible. I have some ideas for features, but not a lot of money/interest in developing them right this second.

- `random()` - On save, generates a random mosaic grid out of a collection of user-defined sizes.
- Built-in `postcss-calc` and provide a global/local setting to activate it with rounding precision.

[Back to top ↑](#table-of-contents)

## Thanks

To everyone who has taken interest in my work over the years, and all the chatroom gurus who have pulled me up each step by my diaper. In particular, Neil Kistner worked hard and helped me learn a lot about ES2015 during the early days of postcss-ant.

As always, thank you to Maria Keller for her excellent logo design. Hire this amazing illustrator/videographer!

[Back to top ↑](#table-of-contents)

## Contributing

- Ping me via Issues or Gitter before you undertake any large changes so we can get on the same page. It's unlikely I'll merge a huge code change unless I'm along for the ride early on.
- `fork, clone, npm i, npm start`
- Work on stuff in `lib` (I'm using FlowType in some places but feel free to ignore it -- I'm considering removing it all together or migrating to Typescript).
- Test demos in `demo/index.html, demo/tests.styl`. AVA tests are in the works, but you'll need to add a visual demo regardless.

[Back to top ↑](#table-of-contents)
