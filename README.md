# postcss-ant

## Installation

`npm install postcss-ant`

## Usage

- `npm install postcss-cli`
- `node_modules/.bin/postcss -w -u postcss-ant -o style.post.css style.css`

```html
<section>
  <div></div>
  <div></div>
  <div></div>
</section>
```

```scss
// style.css
section {
  generate-grid: columns(100px 1/3 auto);
}
```

![](github/img/simple-example.png)

&nbsp;

### Another grid?!

Whoa! Hold up! Don't close that tab! Hit that ★ instead!

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

![](github/img/center.png)

Obviously there are better ways to center elements. This is just an example -- off the top of my head -- which should show how flexible size-getting can be. You can think of almost any type of size you could ever need, and postcss-ant can return it.

---

Since grid generation happens to be such a common use-case, postcss-ant has a `generate-grid` helper property (aliased as `gg`) that can cast low-bloat grids that make other CSS grids look like childrens' toys.

**Grid Example:**

```html
<section>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</section>
```

```scss
section {
  generate-grid:
    columns(1/3 auto 100px, 1/2 1/2)
    rows(150px 150px 150px, 200px 200px);
}
```

- That will produce a grid with two rows.
- The first row will have three columns of sizes: `1/3`, `auto`, and `100px` (in that order). Each of those elements will be `150px` tall (as defined in the `rows()` method).
- The second row will have two `1/2` columns that are each `200px` tall.
- These rows will repeat indefinitely. Every odd row will be `150px` tall with `1/3 auto 100px` columns. Every even row will be `200px` tall with `1/2 1/2` columns.

![](github/img/1-3-auto-100.png)

&nbsp;

### But Flexbox?!

Flexbox is a bad grid replacement since `flex-grow` doesn't take gutters into account when spanning multiple columns -- unless you're making those padding-based grids that require a significant amount of markup bloat. Even then, it would crap-the-bed if the last element was that `auto` (or `flex-grow: 1` in a flexbox approach). It'd stretch the rest of the row (not what you wanted).

Flexbox's strength isn't as a grid replacement -- since it often throws away the concept of "lining things up" that made grids popular in the first place. Flexbox's strengths are:

- Getting rid of `clearfix` bloat.
- Provides predictable alignment rules with one less `<div>`.
- Somewhat simplifies source ordering.

postcss-ant's `generate-grid` property defaults to flexbox for those reasons, but in most "flexbox grid systems" there is very little flexbox is actually bringing to the table.

&nbsp;

### What About Grid Spec?!

Grid Spec won't be out for a few months. It will work in many cutting-edge browsers, but will likely have many bugs since the only people to play with it are a handful of developers since they made the decision to hide it behind a browser flag. It will just straight-up break websites in browsers without support (several percentage of users for a few years).

You should learn Grid Spec after it launches -- and bugs have been identified & have workarounds. Many of its features are very nice, and its API is extremely terse. postcss-ant shares a lot of Grid Spec's most useful features but **postcss-ant works in IE9 (IE8 with polyfills)**.

There are 3 categories of layout tools. postcss-ant, Grid Spec, and everything else.

|| postcss-ant | Grid Spec | Everything else
:-:|:-:|:-:|:-:
**Fractions** | ✔ | ❌ | Jeet & Lost
**Fixed units and fractions** | ✔ | ❌ | ❌
**Fixed units and auto** | ✔ | ✔ | Flexbox
**Fixed units, fractions, and auto** | ✔ | ❌ | ❌
**Size-getting function** | ✔ | ❌ | Susy & Jeet
**2D layouts** | ❌ | ✔* | ❌
**Seamless source ordering** | ❌ | ✔ | Flexbox
**Composable API** | ✔ | ✔ | Flexbox & Susy
**Easy ratios** | ✔ | ❌ | ❌

\****2D layouts are nothing to sneeze at and Grid Spec does this with minimal markup. This is the biggest reason to learn Grid Spec.***

> **Note:** Grid Spec's free-space units (`fr`) can span (e.g. `2fr` would span twice as much as `1fr`). I can port this functionality over, but I'm extremely poor _(yay open source!)_ so it's low on my todo list. In the meantime, postcss-ant uses the `auto` keyword which is equivalent to `1fr` but cannot span -- you can nest markup to achieve a similar effect if you really need it.

&nbsp;

## API

#### `sizes()` and `pluck()`

To return a single size, postcss-ant needs to know what sizes you're using. For instance, to get whatever is left over after `100px`, you'd need to let postcss-ant know about that `100px`.

So you pass a set of space-separated sizes like so: `width: sizes(100px auto);`.

But postcss-ant still doesn't know what value you're looking for out of the two, so you need to specify a `pluck()`.

- `width: sizes(100px auto) pluck(1);` returns `100px`.
- `width: sizes(100px auto) pluck(2);` returns `calc((99.99% - (100px) - ((1 + 1 - 1) * 30px)) / 1)`. It looks nasty, but it works. That `calc` formula will return a `%` of whatever is left over.

> **Tip:** `postcss-calc` can clean it up a bit if it offends your sensibilities. Would appreciate a PR to clean these up, but I just don't have time/desire to revisit them for aesthetic reasons.

![](github/img/100px-auto.png)

#### Order of Operations

You can use any combination of fixed numbers (**any** valid CSS length), fractions, and the `auto` keyword(s).

The order of operations is `fixed -> fractions -> autos`.

- `sizes(100px 1/3 auto) pluck(1)` returns `100px`.
- `sizes(100px 1/3 auto) pluck(2)` returns `1/3` of what's left over _after_ `100px` is subtracted.
- `sizes(100px 1/3 auto) pluck(3)` returns whatever is leftover after `100px` _and_ that `1/3` is subtracted.

![](github/img/100px-1-3-auto.png)


#### `generate-grid`

Aliased as `gg` since you'll likely be using this frequently.

`generate-grid` accepts `columns()` and `rows()`.

In turn, `columns()` and `rows()` accept a comma-separated, space-separated set of sizes.

Each space-separated list of sizes is referred to as a **"size set"**. In `columns()`, each size set will create a row of elements of those sizes. For instance, `columns(1/2 1/2)` will create two half-sized columns and automatically repeat onto new rows.

Each comma-separation in `columns()` will create a new row.

`rows()` pair with the sizes in `columns()` and will adjust those columns' heights.

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

![](github/img/1-3-1-3-1-3-1-2-1-2.png)

You don't have to specify `rows()` and typically won't need to.

#### `ratio()`

Check this out. We can pass `ratio()` to `sizes()` or `columns()`/`rows()`.

We'll break these out to their own lines for readability.

```html
<section>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</section>
```

```scss
section {
  $gold: 1.618;

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

![](github/img/ratio-grid.png)

You can reorder those and combine them with fixed units. Fractions and `auto`s won't work in this context since `ratio()` operates on remaining space.

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

![](github/img/ratio-with-fixed.png)

&nbsp;

### Global Settings

As per PostCSS plugin convention, globals are set as atRules (like an `@import`).

---

##### @ant-namespace

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

---

##### @ant-gutters 30px, 30px

postcss-ant offers two gutter settings. One is for the space between columns, the other is for the space between rows. If you only specify a singular gutter (e.g. `@ant-gutter`), it will set both.

```scss
@ant-gutters 15px, 45px;

section {
  gg:
    columns(1/2 1/2, 1/3 1/3 1/3)
    rows(100px 100px, 200px 200px 200px);
}
```

---

##### @ant-support flexbox

Flexbox is the default since it's supported in most modern browsers and offers bloat-cleanup, equal-height columns, and syntactic sugar for things like alignment/source ordering -- but if you need to support older browsers, postcss-ant also offers a `float` option that will use floats instead of flexbox to support IE9 (and IE8 with a few polyfills).

---

##### @ant-technique nth

There are multiple ways to create CSS grids.

- `nth`: You can say "every element should have a gutter except the last element in a row".
  - **Pros:** Very light markup.
  - **Cons:** You need to know how many elements will go in each row.
- `negative-margin`: The containing element has a negative-margin. Elements within that container will get a margin on their sides. These are particularly good for photo galleries or somewhere you're confident will have varying sized columns randomly on each row.
  - **Pros:** You don't need to know how many elements per row.
  - **Cons:** More markup -- especially when nesting.

> **Tip:** You can mimic padding-based layouts (like Bootstrap and the plethora of flexbox grids out there) simply by removing gutters. These grids work well with flexbox source ordering but require a significant amount of additional markup.

---

##### @ant-children nth-child

`generate-grid` operates by assigning an nth selector to immediate children. By default, this is `nth-child`, but you can change this to `nth-of-type` if you prefer that style.

---

##### @ant-rounders 99.99%, 99.999999%

Sub-pixel rounding is a big problem with fluid grids. A lot of browsers implement their own way to round sub-pixels. These discrepancies are different if you're using gutters (the first number), and if you're not using gutters (the second number). They're also exacerbated when nesting. You typically won't notice this, but if the specific layouts you are creating cause a missing pixel here and there, you can modify it here.

It's probably best to leave this global setting alone, and modify rounders on a local level.

Like `@ant-gutters`, this setting offers a singular (e.g. `@ant-rounder`) that will set both -- although this is strongly discouraged since the pixel rounding between gutter and gutter-less sizes is significant.

### Local Settings

Excluding namespace, all of postcss-ant's global settings can be set on a local level. For instance, you can set `50px` gutters on a global level, and still have the ability to modify the gutter on specific grids throughout your project.

postcss-ant's API for this was intentionally designed to be very composable. That is, you tack these settings on where you deem fit. Think of these like chainable functions in jQuery.

These local settings work alongside `generate-grid` **and** `sizes() pluck()`.

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

In addition to being able to override global settings, local settings offer a few more powerful functions to take advantage of...

---

##### sizes() and pluck()

`generate-grid` (or `gg`) and `sizes() pluck()` are the two most common techniques you'll use with postcss-ant, so it bears expanding its definition with examples.

`sizes()` accepts a single space-separated list of sizes. As noted above, these sizes can be any combination of valid CSS units, fractions/decimals, and `auto`s.

When `sizes()` is used, you are **required** to use `pluck()`.

Imagine `sizes()` is an array, and `pluck()` is the index on that array. `pluck()` will get the size you pick.

**Contrived Example:**

```scss
div {
  width: sizes(100px 200px 300px) pluck(2); // returns the second size: 200px
}
```

**A Non-contrived Example:**

```html
<section>
  <aside>Sidebar</aside>
  <main>Content</main>
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

![](github/img/300px-auto.png)

&nbsp;

#### Creating Your Own Grid Selectors

You might be used to indexes being 0-based. `pluck()` is 1-based (starts at 1). This parallels with how the W3C implemented `nth` selectors so that it's very easy to create preprocessor loops that pluck the same index as the element they are affecting.

This means with a bit of preprocessor looping knowledge you can easily bespoke grid classes that were never achievable before:

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

These are only the sizes, you'd need to add a custom grid class like so:

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

![](github/img/ratio-grid-classes.png)

&nbsp;

#### Create Your Own Attribute-driven Grid

Combining `sizes()` and `pluck()` with looping opens up a world of interesting approaches. Let's create a grid that is driven by very readable attributes:

```html
<section data-grid="columns(4)">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</section>
```

```scss
// in.scss
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
/* out.css */
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
/* final.css */
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

![](github/img/thirds.png)

> This particular example isn't very flexible, but I've made some pretty cool/flexible attribute grids using postcss-ant in the past.

> The point of this section isn't to hand you selector grid -- that's not the point of postcss-ant -- but rather to get you pumped about playing with loops and postcss-ant to make/use/market your own grids. Please ping me in Gitter or via Issues if you make something.

> I'd love to see if the community can come up with some really awesome selector grid. 😻

---

##### bump()

The final method postcss-ant offers is `bump()`. Every now and then you'll try to generate a specific size, but it will be off by a gutter, or 1.5x gutter, or just a few pixels, or _something!_ `bump()` offers you a way to nudge elements exactly where you need them.

`bump()` accepts anything you'd like to tack onto the end of the `calc` formula postcss-ant returns.

`bump()` accepts any valid `calc` expression. If no operator is specified at the beginning of an expression, `bump()` defaults to addition.

**Example:**

```html
<section>
  <div></div>
  <div class="move-right"></div>
  <div></div>
</section>
```

```scss
section {
  generate-grid: columns(1/3 1/3 1/3);
}

.move-right {
  position: relative;
  left: sizes(1/3) pluck(1) bump(30px);
}
```

&nbsp;

### Contributing

- `fork, clone, npm i, npm start`
- Work on stuff in `lib`. Test demos in `demo/index.html, demo/tests.styl`. AVA tests are in the works, but you'll need to add a demo regardless.
