const returnSelf = (result) => Promise.resolve(result);

export default function asyncThrottleCache(fn, wait = 0, {
  key = (...args) => JSON.stringify(args),
  serialize = returnSelf,
  deserialize = returnSelf,
  debounce = undefined,
} = {}) {
  const cache = {};
  const debounceLeading = debounce?.leading;
  return function (...args) { // eslint-disable-line func-names
    const cacheKey = key(...args);
    const cached = cache[cacheKey];
    const onFinish = (index, err, result) => {
      const cachedF = cache[cacheKey];
      if (cachedF?.i === index) {
        cachedF.f = true;
        if (err) {
          cachedF.e = err;
          cachedF.j.map((f) => f(err));
        } else {
          serialize(result)
            .then((r) => {
              cachedF.r = r;
              cachedF.s.map((f, i) => deserialize(r).then(f, cachedF.j[i]));
            }, onFinish);
        }
        if (!cachedF.t || (debounce && !debounceLeading)) {
          delete cache[cacheKey];
        }
      }
      return result;
    };
    const exec = () => {
      const cachedE = cache[cacheKey];
      const i = cachedE.i = Date.now();
      cachedE.f = false;
      return fn.apply(this, args)
        .then((result) => onFinish(i, undefined, result), (err) => {
          onFinish(i, err);
          return Promise.reject(err);
        });
    };
    const timeout = () => setTimeout(() => {
      const cachedT = cache[cacheKey];
      if (cachedT) {
        if (debounce && cachedT.s.length) {
          exec();
        } else if (cachedT.f) {
          delete cache[cacheKey];
        } else {
          cachedT.t = 0;
        }
      }
    }, wait);
    const padding = () => new Promise((resolve, reject) => {
      const cachedP = cache[cacheKey];
      cachedP.s.push(resolve);
      cachedP.j.push(reject);
    });
    if (cached) {
      if (debounce) {
        clearTimeout(cached.t);
        cached.t = timeout();
      } else {
        const {
          e, // error
          r, // result
          f, // finished
        } = cached;
        if (e !== undefined) {
          return Promise.reject(e);
        }
        if (f) {
          return deserialize(r);
        }
      }
      return padding();
    }
    cache[cacheKey] = {
      s: [], // resolve callbacks
      j: [], // reject callbacks
      t: timeout(),
    };
    return (!debounce || debounceLeading) ? exec() : padding();
  };
}
