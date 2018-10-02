[![npm](https://img.shields.io/npm/v/telescopejs.svg)]()

Telescope
=========

Telescope is another state management library for JS ecosystem, this time based on lenses. It's an alternative to Redux for the brave as it's still a baby and is learning to give its first steps.

## The Basics

What a Telescope is, what a lens is. What does it mean to magnify. Some samples.

## Composition

How to compose lenses and what does this means in terms of logic separation.

## Telescope and React

Explain how to use Telescope, or at least how we think it can be used.

## Telescope and Angular

Same as above but for Angular.

## Lenses

Lenses were first described and implemented by Edward Kmett for Haskell and since then have been getting more and more attention as a powerful abstraction for composable accessors.

Lenses are one of many other optics and while we only use lenses in Telescope, we do are planning to add Prisms and other toys to the box.

## Development

The code in this library is pretty small but we still need a minimal pipeline for testing, building and distributing.

Folder structure:

```
_bundles/		   // UMD bundles
lib/			     // ES5(commonjs) + source + .d.ts
lib-esm/		   // ES5(esmodule) + source + .d.ts
node_modules/  // You know what this is
src/           // All Telescope source code is here
package.json
README.md
tsconfig.json
```

Commands:

* `build:common` builds the CommonJS files (TSC)
* `build:es6` builds the ES6 files (TSC)
* `build:umd` builds the UMD files (Webpack)
* `build` builds everything
* `test` runs all tests

## References

### Software

### Texts

https://marcobotto.com/blog/compiling-and-bundling-typescript-libraries-with-webpack/

You will find a _bibTex_ file in this repo in the remote case you need or want to use it.
