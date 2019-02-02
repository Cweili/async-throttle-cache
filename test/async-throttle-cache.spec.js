const asyncThrottleCache = require('..');

function wait(time = 5) {
  return new Promise(resolve => setTimeout(resolve, time));
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
  const throttled = asyncThrottleCache(fn, 10);
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
  const throttled = asyncThrottleCache(fn, 10);
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
  const throttled = asyncThrottleCache(fn, 10);
  expect(throttled()).rejects.toThrow();
  expect(throttled()).rejects.toThrow();
  await wait(5);
  expect(throttled()).rejects.toThrow();
  await wait(5);
  expect(jestFn).toHaveBeenCalledTimes(1);
  await wait(20);
  expect(throttled()).rejects.toThrow();
  await wait(5);
  expect(jestFn).toHaveBeenCalledTimes(2);
});

it('should throttle function calls identify with custom key', async () => {
  const {
    fn,
    jestFn,
  } = getFn();
  const throttled = asyncThrottleCache(fn, 10, {
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
