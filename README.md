[![npm](https://img.shields.io/npm/v/telescopejs.svg)]()
[![travis](https://travis-ci.org/wigahluk/telescopejs.svg?branch=master)]()

Telescope
=========

Telescope is another state management library for JS ecosystem, this time based on lenses. It's an alternative to Redux for the brave as it's still a baby learning to give its first steps.

## The Basics

A _telescope_ is a special object that handle changes on a complex state by providing handlers to smaller pieces of the big structure, each of these handlers is a new _telescope_ and they are created by _magnifying_ up a special part of the whole thing. As with regular magnification, you need _lenses_ to do this, so, we provide the _lens_ and the _telescope_ focus on what is needed.

```typescript
class Telescope<U> {
  readonly stream: Observable<U>;

  static of<U>(initialState: U): Telescope<U>;

  public evolve(evolution: Evolution<U>): void;

  public update(newState: U): void;

  public magnify<P>(lens: Lens<U, P>): Telescope<P>;
}
```

A _lens_ is a pair of functions, one to get values from an bigger object and another one from creating big objects with a piece and a previos big object:

```typescript
{
  getter : (u: U) => P;
  setter : (p: P, u: U) => U;
}
```

The final implementation is a bit more loaded, but this is the essence.

Lenses can be composed, and this is one of their great features, once you can compose blocks of any type, you have a magical way to create new ones.


## The Story

This story goes more or less as you would expect: How to handle changes on state in an application where many actors need to react to those changes and many actors are producing these changes?

The idea behind Telescope is that each change can be seen as a delta on the previous state, the problem is that unless this state is some kind of number-like value, it is quite difficult to represent what a _delta_ means in its context. The key is that we don’t really need to know what this _delta_ is nor how to _add_ it to the previous state value, we can trust Telescope users to know what to do and encapsulate the _delta_ and the _adding_ process in a function, a function that will take a state value and return a new one:

```typescript
(s: State) => State
```

We call these type of functions `Evolutions` but they have other names too, in Mathematics they are commonly known as _endomorphisms_.

There is a caveat of course. As there are many values for this _deltas_ and maybe different _adding_ processes depending on the particular interaction happening in the application, there will be potentially many evolutions. In Telescope this is OK, evolutions are treated as regular values that encapsulate a _delta_ and an _adding_ process.

The Telescope idea comes from answering this question: What do we do with all these evolutions to get back our states?

The first observation we can do is that these evolutions are not just given, they are pumping up as the user, other systems or even internal processes interact with our application.

The way Telescope deals with this is a common pattern: Streams. But these are special streams, they are streams of evolutions, which is, streams of functions, we still need to figure out where to get values again.

Fortunately, streams belong to a big family of things that can be _folded_ and one special way of _folding_ is to generate a new _foldable_ with the partial results of the _folding_ steps. This _folding_ is commonly named `scan`.

Putting all together means to take the stream of evolutions and scan through it providing an initial state value as a seed (this value may come from a database or simply be a default state). And this is what a _telescope_ is: a convenient wrapper for a stream of evolutions so we can convert them into a stream of values.

The second part of this story is about how we can interact with these _telescopes_ and how we can create new ones from existing ones. That is, how can we create a world that _telescopes_ can inhabit?

## Composition

How to compose lenses and what does this means in terms of logic separation.

## Telescope and React

Explain how to use Telescope, or at least how we think it can be used.

## Telescope and Angular

Same as above but for Angular.

## Lenses

Lenses were first described and implemented by Edward Kmett for Haskell ([github@ekmett/lens](https://github.com/ekmett/lens)) and since then have been getting more and more attention as a powerful abstraction for composable accessors.

Lenses are one of many other optics and while we only use lenses in Telescope, we do are planning to add Prisms and other toys to the box.

## Development

The code in this library is pretty small but we still need a minimal pipeline for testing, building and distributing.

Folder structure:

```
_bundles/            // UMD bundles
coverage/            // Coverage reports
lib/                 // ES5(commonjs) + source + .d.ts
lib-esm/             // ES5(esmodule) + source + .d.ts
node_modules/        // You know what this is
src/                 // All Telescope source code is here
package.json
README.md
tsconfig.json
…
```

Commands:

* `build:common` builds the CommonJS files (TSC)
* `build:es6` builds the ES6 files (TSC)
* `build:umd` builds the UMD files (Webpack)
* `build` builds everything
* `clean` deletes generated files (i.e `./_bundles`, `./lib`, `./lib-esm`.
* `test:d` runs tests in interactive mode
* `test` runs all tests
* `tslint` runs the linter.

## References

### Software

* **Jasmine** is a test framework for JS. [jasmine.github.io](https://jasmine.github.io/).
* **Karma** is a test runner. [karma-runner.github.io](https://karma-runner.github.io/2.0/index.html).
* **RxJS** is a library for Streams, Sinks and other reactive toys. [rxjs-dev.firebaseapp.com](https://rxjs-dev.firebaseapp.com/). This is the only peer dependency for Telescope, all other stuff is used only for the developers contributing to Telescope itself.
* **Typescript** is superset of Javascript that basically adds type annotations. We use it because we love types! [typescriptlang.org](https://typescriptlang.org).
	* **TSLint** is a linter for Typescript. [palantir.github.io/tslint](https://palantir.github.io/tslint/).
* **Webpack** (and **Webpack-CLI**) is a bundler tool commonly used in front end projects. We use it here as a helper for running tests and to transpire UMD modules. [webpack.js.org](https://webpack.js.org/).
	* **Awesome Typescript Loader** allows easy transpilation of Typescript code. [github@s-panferov/awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader).
	* **Istanbul Instrumenter Loader** remaps coverage reports using source maps. Used only here for coverage reports. [github@webpack-contrib/istanbul-instrumenter-loader](https://github.com/webpack-contrib/istanbul-instrumenter-loader).
	* **Source Map Loader** generates source maps from transpilation.

### Texts

* G. Boisseau and J. Gibbons, [What you needa know about yoneda: profunctor optics and the yoneda lemma (functional pearl)](https://www.cs.ox.ac.uk/jeremy.gibbons/publications/proyo.pdf), Proceedings of the ACM on Programming Languages, 2 (2018), p. 84.
* M. Botto. _[Compiling and bundling TypeScript libraries with Webpack](https://marcobotto.com/blog/compiling-and-bundling-typescript-libraries-with-webpack/)_.
* S. P. Jones, [Lenses: compositional data access and manipulation](https://skillsmatter.com/skillscasts/4251-lenses-compositional-data-access-and-manipulation), October 2013.
* E. Kmett, [Lenses, folds and traversals](http://comonad.com/haskell/Lenses-Folds-and-Traversals-NYC.pdf), in Talk at New York Haskell User Group Meeting, 2012.

You will find a [_bibTex_ file](./telescope.bib) in this repo in the remote case you need or want to use it.
