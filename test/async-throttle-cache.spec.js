import asyncThrottleCache from '../async-throttle-cache';

jest.useRealTimers();

function wait(time = 5) {
  return new Promise((resolve) => {
    setTimeout(resolve, time * 10);
  });
}

function getFn(time, error) {
  const jestFn = jest.fn();
  return {
    async fn(arg) {
      await wait(time);
      jestFn();
      if (error) {
        throw error;
      }
      return { arg };
    },
    jestFn,
  };
}

it('should return expected result', async () => {
  const {
    fn,
    jestFn,
  } = getFn();
  const throttled = asyncThrottleCache(fn);
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(jestFn).toHaveBeenCalledTimes(3);
});

it('should throttle function calls', async () => {
  const {
    fn,
    jestFn,
  } = getFn();
  const throttled = asyncThrottleCache(fn, 10 * 10);
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  await wait(10);
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(jestFn).toHaveBeenCalledTimes(2);
});

it('should throttle function calls identify with arguments', async () => {
  const {
    fn,
    jestFn,
  } = getFn(20);
  const throttled = asyncThrottleCache(fn, 10 * 10);
  expect(await Promise.all([
    throttled(1),
    throttled(1),
    throttled(2),
    throttled(2),
  ])).toEqual([
    { arg: 1 },
    { arg: 1 },
    { arg: 2 },
    { arg: 2 },
  ]);
  expect(jestFn).toHaveBeenCalledTimes(2);
});

it('should throw an error when function calls failed', async () => {
  const {
    fn,
    jestFn,
  } = getFn(1, new Error('a error'));
  const throttled = asyncThrottleCache(fn, 10 * 10);
  await Promise.all([
    expect(throttled()).rejects.toThrow(),
    expect(throttled()).rejects.toThrow(),
  ]);
  await wait(5);
  await expect(throttled()).rejects.toThrow();
  await expect(jestFn).toHaveBeenCalledTimes(1);
  await wait(10);
  await expect(throttled()).rejects.toThrow();
  expect(jestFn).toHaveBeenCalledTimes(2);
});

it('should throttle function calls identify with custom key', async () => {
  const {
    fn,
    jestFn,
  } = getFn();
  const throttled = asyncThrottleCache(fn, 10 * 10, {
    key: () => 1,
  });
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(await throttled(1)).toEqual({
    arg: 1,
  });
  expect(await throttled(2)).toEqual({
    arg: 1,
  });
  expect(await throttled(2)).toEqual({
    arg: 1,
  });
  expect(jestFn).toHaveBeenCalledTimes(1);
});

it('should debounce function calls when debounce is true', async () => {
  const {
    fn,
    jestFn,
  } = getFn(2);
  const debounced = asyncThrottleCache(fn, 3 * 10, {
    debounce: true,
  });

  const call1 = debounced(1);

  await wait(1);

  const call2 = debounced(1);

  await wait(1);

  const call3 = debounced(1);

  await wait(10);

  const call4 = debounced(1);

  await Promise.all([
    expect(call1).resolves.toEqual({
      arg: 1,
    }),
    expect(call2).resolves.toEqual({
      arg: 1,
    }),
    expect(call3).resolves.toEqual({
      arg: 1,
    }),
  ]);

  expect(jestFn).toHaveBeenCalledTimes(1);

  expect(await call4).toEqual({
    arg: 1,
  });

  expect(jestFn).toHaveBeenCalledTimes(2);
});

it('should debounce function calls when debounce is { leading: true }', async () => {
  const {
    fn,
    jestFn,
  } = getFn(2);
  const debounced = asyncThrottleCache(fn, 3 * 10, {
    debounce: {
      leading: true,
    },
  });

  const call1 = debounced(1);

  await wait(1);

  const call2 = debounced(1);

  await wait(1);

  const call3 = debounced(1);

  await wait(10);

  const call4 = debounced(1);

  await Promise.all([
    expect(call1).resolves.toEqual({
      arg: 1,
    }),
    expect(call2).resolves.toEqual({
      arg: 1,
    }),
    expect(call3).resolves.toEqual({
      arg: 1,
    }),
  ]);

  expect(jestFn).toHaveBeenCalledTimes(2);

  expect(await call4).toEqual({
    arg: 1,
  });

  expect(jestFn).toHaveBeenCalledTimes(3);
});

it('should serialize and deserialize cached results', async () => {
  const {
    fn,
    jestFn,
  } = getFn();
  const throttled = asyncThrottleCache(fn, 10 * 10, {
    serialize: async (r) => JSON.stringify(r),
    deserialize: async (r) => JSON.parse(r),
  });

  const r1 = await throttled(1);
  const r2 = await throttled(1);

  expect(r1).toEqual({
    arg: 1,
  });
  expect(r2).toEqual({
    arg: 1,
  });
  expect(r1).not.toBe(r2);
  expect(jestFn).toHaveBeenCalledTimes(1);
});

it('should reject pending calls when serialize fails', async () => {
  const {
    fn,
    jestFn,
  } = getFn(2);
  const throttled = asyncThrottleCache(fn, 10 * 10, {
    serialize: async () => {
      throw new Error('serialize error');
    },
  });

  const c1 = throttled(1);
  const c2 = throttled(1);

  await expect(c1).resolves.toEqual({
    arg: 1,
  });
  await expect(c2).rejects.toThrow('serialize error');
  expect(jestFn).toHaveBeenCalledTimes(1);
});

it('should preserve this context', async () => {
  const ctx = {
    n: 42,
    async fn() {
      return this.n;
    },
  };

  ctx.throttled = asyncThrottleCache(ctx.fn, 10 * 10);

  expect(await ctx.throttled()).toBe(42);
});

it('should behave the same when debounce is false or undefined', async () => {
  const a = getFn();
  const b = getFn();
  const t1 = asyncThrottleCache(a.fn, 10 * 10);
  const t2 = asyncThrottleCache(b.fn, 10 * 10, {
    debounce: false,
  });

  await t1(1);
  await t1(1);
  await t2(1);
  await t2(1);

  expect(a.jestFn).toHaveBeenCalledTimes(1);
  expect(b.jestFn).toHaveBeenCalledTimes(1);
});

it('should keep pending calls for latest execution in debounce leading mode', async () => {
  const rs = [];
  const fn = jest.fn(() => new Promise((resolve) => {
    rs.push(resolve);
  }));
  const throttled = asyncThrottleCache(fn, 20, {
    debounce: {
      leading: true,
    },
  });

  const c1 = throttled(1);
  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
  const c2 = throttled(1);

  await new Promise((resolve) => {
    setTimeout(resolve, 30);
  });

  expect(fn).toHaveBeenCalledTimes(2);

  rs[0]({
    arg: 'first',
  });
  expect(await c1).toEqual({
    arg: 'first',
  });

  let done = false;
  c2.then(() => {
    done = true;
  });
  await new Promise((resolve) => {
    setTimeout(resolve, 5);
  });
  expect(done).toBe(false);

  rs[1]({
    arg: 'second',
  });
  expect(await c2).toEqual({
    arg: 'second',
  });
});

it('should reject queued calls and clear cache when flushed', async () => {
  const {
    fn,
    jestFn,
  } = getFn(2);
  const throttled = asyncThrottleCache(fn, 10 * 10);

  const c1 = throttled(1);
  const c2 = throttled(1);
  const c2Result = c2.catch((e) => e);

  throttled.flush();

  await expect(c1).resolves.toEqual({
    arg: 1,
  });
  expect(await c2Result).toEqual(expect.objectContaining({
    message: 'flushed',
  }));

  await throttled(1);
  expect(jestFn).toHaveBeenCalledTimes(2);
});

it('should reject all debounced calls when function failed', async () => {
  const {
    fn,
    jestFn,
  } = getFn(1, new Error('debounce error'));
  const debounced = asyncThrottleCache(fn, 3 * 10, {
    debounce: true,
  });

  const c1 = debounced(1);
  await wait(1);
  const c2 = debounced(1);

  await Promise.all([
    expect(c1).rejects.toThrow('debounce error'),
    expect(c2).rejects.toThrow('debounce error'),
  ]);
  expect(jestFn).toHaveBeenCalledTimes(1);
});

it('should work with rapid successive calls in different windows', async () => {
  let c = 0;
  const fn = async () => {
    c += 1;
    return c;
  };
  const throttled = asyncThrottleCache(fn, 0);

  expect(await throttled()).toBe(1);
  await wait(1);
  expect(await throttled()).toBe(2);
});
