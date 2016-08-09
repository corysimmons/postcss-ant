<img src="postcss-ant-logo.svg" width="200">

A size getting function capable of grabbing auto lengths. Better than flexbox[*](#what-about-flexbox).

### Tinker
- `npm i`
- `npm run dev`
- Play around with `demo/index.html` and `demo/css/in.scss`. Navigate to http://localhost:3000 (or whatever BrowserSync says in your terminal) to see it.
- `demo/css/out.css` is what your `in.scss` is transformed to.

### Installation

- `mkdir ~/Desktop/playground/ant; cd ~/Desktop/playground/ant; echo '{}' > package.json; npm i -D postcss postcss-cli postcss-ant`

### CLI Usage

- `node_modules/.bin/postcss -u postcss-ant -w -d dist 'src/**/*'`

> This will watch everything in your `src` dir, run it through `postcss-ant`, and :poop: it out into the `dist` dir. So make sure you have something like `src/in.css` with some ant functions in it.

For other PostCSS plugin usages: https://github.com/postcss/postcss#usage

### Docs

ant isn't 0-indexed like most arrays. This is so it matches CSS's implementation of nth selectors (where `:nth-child(1)` selects the first item). This was done on purpose so preprocessor looping is easier -- not to be a special snowflake.

So `ant(1px 2px 3px)[1]` returns `1px`.

Space separate values, but you can pass anything in the damn world to `ant`... fixed numbers (`150px`, `3em`, `50ch`, `5%`, etc.), fractions or decimals (`1/4`, `.66`, etc.), and the insanely sexy `auto` (which is kind of like `flex: 1` -- only better[*](#what-about-flexbox)).

After a comma, you can specify a local gutter: `width: ant(1/2, 45px)[1]` would return half the size of a container sans the gutter (so 2 of these elements would fill a container perfectly with a `45px` gutter between them).

You can set a global gutter too as an atRule (top of your stylesheet): `@ant-gutter 70px;`. If nothing is specified, the default gutter size is `30px`. You can set the global or local gutter to `0` to get rid of gutters.

That's it. You're done with the API.

Apply these returned sizes to widths, heights, flex-basis, grid layout(?), etc. etc. etc.

Loop them with preprocessor loops like so:

```scss
section {
  overflow: hidden;

  div {
    $gutter: 45px;

    &:nth-child(n) {
      float: left;
      margin-right: $gutter;
      height: 50px;
      background: tomato;
    }

    @for $i from 1 to 6 {
      &:nth-child(6n + $(i)) {
        width: ant(12% 1/4 auto 60px auto 7%, $gutter)[$(i)];
      }
    }

    &:nth-child(6n) {
      margin-right: 0;
    }
  }
}
```

The above example will make a pretty crazy looping grid with 6 columns per row, without the need for superfluous row elements.

### postcss-calc

The returned `calc` functions can get insane so I suggest you run [`postcss-calc`](https://github.com/postcss/postcss-calc) after `postcss-ant` in order to trim down some of the bloat. I'm prrretty sure the shrinking is flawless, but it could possibly break something, so I'd like to keep them separated.

---

### What about flexbox?

I'll explain the weak points of flexbox in an upcoming tutorial and link it here.
