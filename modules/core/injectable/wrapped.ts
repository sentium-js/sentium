import { InjectableManager } from "./manager.ts";
import { resolve } from "./resolver.ts";

/**
 * A class that wraps a value.
 */
export abstract class Wrapped<T> {
  constructor(
    /**
     * The wrapped value.
     */
    public readonly value: T,
  ) {}
}

/**
 * Type of a wrapper class.
 */
export type WrapperClass<T = unknown> = new () => Wrapped<T>;

/**
 * Wrap an arbitrary value in a class and make it injectable.
 *
 * This is useful for when you want to inject a value that is not a class.
 *
 * @param value The value to wrap.
 * @returns A class that wraps the value and is injectable.
 */
export const wrap = <const T = unknown>(value: T): WrapperClass<T> => {
  // create a wrapper class with the value that extends the Wrapped class
  const wrapperClass = class extends Wrapped<T> {
    constructor() {
      super(value);
    }
  };

  // declare the wrapper class as injectable
  new InjectableManager(wrapperClass).declare([]);

  // return the wrapper class
  return wrapperClass;
};

/**
 * Unwrapped value of a wrapped instance or a wrapper class.
 */
export type Unwrapped<T extends Wrapped<unknown> | WrapperClass<unknown>> =
  T extends Wrapped<
    infer U
  > ? U
    : T extends WrapperClass<infer U> ? U
    : never;

/**
 * Unwrap a value from a wrapped instance or a wrapper class.
 *
 * @param wrapper The wrapped instance or the wrapper class.
 * @returns The unwrapped value.
 */
export const unwrap = <T>(wrapper: Wrapped<T> | WrapperClass<T>): T => {
  if (wrapper instanceof Wrapped) {
    return wrapper.value;
  } else {
    return resolve(wrapper).value;
  }
};
