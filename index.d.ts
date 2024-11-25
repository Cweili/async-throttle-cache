/**
 * Creates a throttled function that only invokes `fn` at most once per every `wait` milliseconds, and returns cached result.
 */
declare function asyncThrottleCache<
  /**
   * Asynchronous function type.
   */
  T extends (...args: any[]) => any,

  /**
   * Serialized result type.
   */
  U,
>(
  /**
   * Asynchronous function to be throttled.
   */
  fn: T,

  /**
   * Throttle wait time, unit is milliseconds.
   */
  wait?: Number,

  /**
   * Options
   */
  options?: {
    /**
     * Specify how to generate cache key. Different cache key will re-invoke fn to get a new result.
     */
    key?: (...args: Parameters<T>) => string

    /**
     * Serialize method for cached result, it could be a asynchronous function.
     */
    serialize?: (result: Awaited<ReturnType<T>>) => Promise<U>

    /**
     * Deserialize method for cached result, it could be a asynchronous function.
     */
    deserialize?: (serialized: U) => ReturnType<T>

    /**
     * Debounce mode, if true, fn will be invoked after wait time since last call.
     */
    debounce?: boolean | { leading: boolean }
  },
): T;

export = asyncThrottleCache
