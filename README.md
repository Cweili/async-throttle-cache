# async-throttle-cache

[![npm][badge-version]][npm]
[![bundle size][badge-size]][bundlephobia]
[![npm downloads][badge-downloads]][npm]
[![license][badge-license]][license]


[![github][badge-issues]][github]
[![build][badge-build]][workflows]
[![coverage][badge-coverage]][coveralls]


Throttle or debounce asynchronous functions and return cached result for each function calls. It can be used for rate limit.

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
  debounce: undefined | true | false | { leading: true },
}]]);
```

Creates a throttled function that only invokes `fn` at most once per every `wait` milliseconds, and returns cached result.

You can specify how to generate cache `key`. Different cache `key` will re-invoke `fn` to get a new result.

`serialize` and `deserialize` is for cached result, they could be asynchronous functions.

`debounce` is for debounce mode, if true, fn will be invoked after wait time since last call.

For example, clone result for each time throttled function execution in 1000 milliseconds. It's useful when you tend to modify the result object.

```js
const throttleFn = asyncThrottleCache(fn, 1000, {
  serialize: async result => JSON.stringify(result),
  deserialize: async result => JSON.parse(result),
});
```

## Examples

```js
// define a asynchronous function, return after 100ms
function fn(arg1, arg2) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      arg1,
      arg2
    }), 100);
  });
}
```

```js
const throttleFn150ms = asyncThrottleCache(fn, 150); // longer then function execution

(async () => {
  throttleFn150ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  throttleFn150ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn150ms(2, 2); // invoke,     return { arg1: 2, arg2: 2 } at 100ms
  await throttleFn150ms(2, 2); // from cache, return { arg1: 2, arg2: 2 } at 100ms
})();
```

```js
const throttleFn50ms = asyncThrottleCache(fn, 50); // shorter then function execution

(async () => {
  throttleFn50ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  throttleFn50ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn50ms(2, 2); // invoke,     return { arg1: 2, arg2: 2 } at 100ms
  await throttleFn50ms(2, 2); // invoke,     return { arg1: 2, arg2: 2 } at 200ms
})();
```

```js
const throttleFn150ms = asyncThrottleCache(fn, 150, {
  key: (arg1, arg2) => JSON.stringify(arg2), // uses arg2 as key
});

(async () => {
  throttleFn150ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  throttleFn150ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn150ms(2, 2); // from cache, return { arg1: 1, arg2: 2 } at 100ms
  await throttleFn150ms(2, 2); // from cache, return { arg1: 1, arg2: 2 } at 100ms
})();
```

```js
const debounceFn250ms = asyncThrottleCache(fn, 250, {
  debounce: true,
});

(async () => {
  debounceFn250ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 350ms
  debounceFn250ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 350ms
  debounceFn250ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 750ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn250ms(2, 2);       // from cache, return { arg1: 2, arg2: 2 } at 750ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn250ms(2, 2);       // from cache, return { arg1: 2, arg2: 2 } at 750ms
})();
```

```js
const debounceFn50ms = asyncThrottleCache(fn, 50, {
  debounce: true,
});

(async () => {
  debounceFn50ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 150ms
  debounceFn50ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 150ms
  debounceFn50ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 150ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn50ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 350ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn50ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 550ms
})();
```

```js
const debounceFn250ms = asyncThrottleCache(fn, 250, {
  debounce: {
    leading: true,
  },
});

(async () => {
  debounceFn250ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  debounceFn250ms(1, 2);       // from cache, return { arg1: 1, arg2: 2 } at 100ms
  debounceFn250ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 100ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn250ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 750ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn250ms(2, 2);       // from cache, return { arg1: 2, arg2: 2 } at 750ms
})();
```

```js
const debounceFn50ms = asyncThrottleCache(fn, 50, {
  debounce: {
    leading: true,
  },
});

(async () => {
  debounceFn50ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 100ms
  debounceFn50ms(1, 2);       // invoke,     return { arg1: 1, arg2: 2 } at 150ms
  debounceFn50ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 100ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn50ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 300ms
  await new Promise((resolve) => setTimeout(resolve, 200));
  debounceFn50ms(2, 2);       // invoke,     return { arg1: 2, arg2: 2 } at 500ms
})();
```

[badge-version]: https://img.shields.io/npm/v/async-throttle-cache.svg
[badge-downloads]: https://img.shields.io/npm/dt/async-throttle-cache.svg
[npm]: https://www.npmjs.com/package/async-throttle-cache

[badge-size]: https://img.shields.io/bundlephobia/minzip/async-throttle-cache.svg
[bundlephobia]: https://bundlephobia.com/result?p=async-throttle-cache

[badge-license]: https://img.shields.io/npm/l/async-throttle-cache.svg
[license]: https://github.com/Cweili/async-throttle-cache/blob/master/LICENSE

[badge-issues]: https://img.shields.io/github/issues/Cweili/async-throttle-cache.svg
[github]: https://github.com/Cweili/async-throttle-cache

[badge-build]: https://img.shields.io/github/actions/workflow/status/Cweili/async-throttle-cache/ci.yml?branch=master
[workflows]: https://github.com/Cweili/async-throttle-cache/actions/workflows/ci.yml?query=branch%3Amaster

[badge-coverage]: https://img.shields.io/coveralls/github/Cweili/async-throttle-cache/master.svg
[coveralls]: https://coveralls.io/github/Cweili/async-throttle-cache?branch=master
