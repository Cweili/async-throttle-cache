declare namespace Options {
  declare interface key {
    (...args: any[]): String
  }

  declare interface serialize {
    (result: any): Promise<any>
  }

  declare interface deserialize {
    (serialized: any): Promise<any>
  }
}

declare function asyncThrottleCache(
  fn: Function,
  wait: Number,
  options: {
    key: Options.key
    serialize: Options.serialize
    deserialize: Options.deserialize
  }
): Function

export = asyncThrottleCache