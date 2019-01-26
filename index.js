const returnSelf = result => Promise.resolve(result);

export default function asyncThrottleCache(fn, wait = 0, {
  key = (...args) => JSON.stringify(args),
  serialize = returnSelf,
  deserialize = returnSelf,
} = {}) {
  const cache = {};
  return (...args) => {
    const cacheKey = key(...args);
    if (cache[cacheKey]) {
      const cached = cache[cacheKey];
      const {
        e,
        r,
      } = cached;
      if (r !== undefined) {
        return deserialize(r);
      }
      if (e !== undefined) {
        return Promise.reject(e);
      }
      return new Promise((resolve, reject) => {
        cached.s.push(resolve);
        cached.j.push(reject);
      });
    }
    cache[cacheKey] = {
      s: [],
      j: [],
      t: setTimeout(() => {
        const cached = cache[cacheKey];
        if (cached.r !== undefined || cached.e !== undefined) {
          delete cache[cacheKey];
        } else {
          cached.t = 0;
        }
      }, wait),
    };
    const onFinish = (err, result) => {
      if (cache[cacheKey]) {
        const cached = cache[cacheKey];
        const {
          j,
          s,
        } = cached;
        if (err) {
          cached.e = err;
          j.map(f => f(err));
        } else {
          serialize(result)
            .then((r) => {
              cached.r = r;
              s.map((f, i) => deserialize(r).then(f, j[i]));
            }, onFinish);
        }
        if (!cached.t) {
          delete cache[cacheKey];
        }
      }
      return result;
    };
    return fn(...args)
      .then(result => onFinish(undefined, result), (err) => {
        onFinish(err);
        return Promise.reject(err);
      });
  };
}
