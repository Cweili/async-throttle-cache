# async-throttle-cache

[![npm][npm-version]][npm]
[![npm][npm-size]][npm]
[![npm][npm-downloads]][npm]
[![npm][npm-license]][npm]


[![github][github-issues]][github]
[![travis][travis-build]][travis]
[![codecov][codecov-svg]][codecov]


Throttle asynchronous functions and return cached result for each function calls. It can be used for rate limit.

## Installation

### NPM

```
npm install async-throttle-cache --save
```

```js
import asyncThrottleCache from 'async-throttle-cache';
```

### Browser

Direct `<script>` include

```html
<script src="https://cdn.jsdelivr.net/npm/async-throttle-cache"></script>
```

## Usage

```js
const throttleFn = asyncThrottleCache(fn[, wait = 0[, options = {
  key: (...args) => JSON.stringify(args),
  serialize: result => Promise.resolve(result),
  deserialize: result => Promise.resolve(result),
}]]);
```

Creates a throttled function that only invokes `fn` at most once per every `wait` milliseconds, and returns cached result.

You can specify how to generate cache `key`. Different cache `key` will re-invoke `fn` to get a new result.

`serialize` and `deserialize` is for cached result, they could be asynchronous functions.

For example, clone result for each time throttled function execution in 1000 milliseconds. It's useful when you tend to modify the result object.

```js
const throttleFn = asyncThrottleCache(fn, 1000, {
  serialize: async result => JSON.stringify(result),
  deserialize: async result => JSON.parse(result),
}]]);
```

## Examples

```js
// define a asynchronous function, return after 100ms
function fn(arg1, arg2) {
  return new Promise((resolve) => {
    setTimeout(resolve({
      arg1,
      arg2
    }), 100);
  });
}
```

```js
const throttleFn200ms = asyncThrottleCache(fn, 200); // longer then function execution

async () => {
  throttleFn200ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  throttleFn200ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn200ms(2, 2); // invoke,     return { arg1: 2, arg2: 2 } at 100ms
  await throttleFn200ms(2, 2); // from cache, return { arg1: 2, arg2: 2 } at 100ms
}();
```

```js
const throttleFn50ms = asyncThrottleCache(fn, 50); // shorter then function execution

async () => {
  throttleFn50ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  throttleFn50ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn50ms(2, 2); // invoke,     return { arg1: 2, arg2: 2 } at 100ms
  await throttleFn50ms(2, 2); // invoke,     return { arg1: 2, arg2: 2 } at 200ms
}();
```

```js
const throttleFn200ms = asyncThrottleCache(fn, 200, {
  key: (arg1, arg2) => JSON.stringify(arg2) // uses arg2 as key
});

async () => {
  throttleFn200ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  throttleFn200ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn200ms(2, 2); // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn200ms(2, 2); // from cache, return { arg1: 1, arg2: 2 } at 100ms
}();
```

[npm]: https://www.npmjs.com/package/async-throttle-cache
[npm-version]: https://img.shields.io/npm/v/async-throttle-cache.svg
[npm-size]: https://img.shields.io/bundlephobia/minzip/async-throttle-cache.svg
[npm-downloads]: https://img.shields.io/npm/dt/async-throttle-cache.svg
[npm-license]: https://img.shields.io/npm/l/async-throttle-cache.svg

[github]: https://github.com/Cweili/async-throttle-cache
[github-issues]: https://img.shields.io/github/issues/Cweili/async-throttle-cache.svg

[travis]: https://travis-ci.org/Cweili/async-throttle-cache
[travis-build]: https://travis-ci.org/Cweili/async-throttle-cache.svg?branch=master

[codecov]: https://codecov.io/gh/Cweili/async-throttle-cache
[codecov-svg]: https://img.shields.io/codecov/c/github/Cweili/async-throttle-cache.svg
