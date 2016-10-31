# postcss-ant

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

Since grid generation happens to be such a common use-case, postcss-ant has a `generate-grid` (aliased as `gg`) helper property the can cast low-bloat grids that make other CSS grids look like childrens' toys.

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

There are 3 categories of layout tools. postcss-ant, Grid Spec, and everything else.

| postcss-ant | Grid Spec | Everything else
-|-
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

You don't have to specify `rows()` and typically won't want to.

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

### Global Settings

As per PostCSS plugin convention, globals are set as atRules (like an `@import`).

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

##### @ant-gutters 30px, 30px

postcss-ant offers two gutter settings. One is for the space between columns, the other is for the space between rows. If you only specify a single gutter, it will set both.

```scss
@ant-gutters 15px, 45px;

section {
  gg:
    columns(1/2 1/2, 1/3 1/3 1/3)
    rows(100px 100px, 200px 200px 200px);
}
```

##### @ant-support flexbox
##### @ant-technique nth
##### @ant-children nth-child
##### @ant-rounders 99.99%, 99.999999%
