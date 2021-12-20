declare namespace Options {
  declare interface key {
    /**
     * Specify how to generate cache key. Different cache key will re-invoke fn to get a new result.
     */
    (...args: any[]): String
  }

  declare interface serialize {
    /**
     * Method for cached result, it could be asynchronous functions.
     */
    (result: any): Promise<any>
  }

  declare interface deserialize {
    /**
     * Method for cached result, it could be asynchronous functions.
     */
    (serialized: any): Promise<any>
  }
}

/**
 * Creates a throttled function that only invokes `fn` at most once per every `wait` milliseconds, and returns cached result.
 */
declare function asyncThrottleCache(
  /**
   * Creates a throttled function that only invokes `fn` at most once per every `wait` milliseconds, and returns cached result.
   */
  fn: Function,

  /**
   * Creates a throttled function that only invokes `fn` at most once per every `wait` milliseconds, and returns cached result.
   */
  wait?: Number,

  /**
   * Options
   */
  options?: {
    key: Options.key
    serialize: Options.serialize
    deserialize: Options.deserialize
  }
): Function

export = asyncThrottleCache
