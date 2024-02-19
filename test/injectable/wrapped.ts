/// <reference lib="deno.ns" />
import {
  injectable,
  resolve,
  unwrap,
  wrap,
  Wrapped,
} from "../../modules/core/mod.ts";
import { assertStrictEquals } from "std/assert/assert_strict_equals.ts";

Deno.test("wrapped value", () => {
  const arbitraryValue = { hello: "world" };

  const WrapperClass = wrap(arbitraryValue);

  const wrapperInstance = new WrapperClass();
  const resolvedWrapperInstance = resolve(WrapperClass);

  assertStrictEquals(arbitraryValue, unwrap(WrapperClass));
  assertStrictEquals(arbitraryValue, unwrap(wrapperInstance));
  assertStrictEquals(arbitraryValue, unwrap(resolvedWrapperInstance));
  assertStrictEquals(arbitraryValue, resolvedWrapperInstance.value);
  assertStrictEquals(arbitraryValue, wrapperInstance.value);
});

Deno.test("class with wrapped value inject", () => {
  const arbitraryValue = { hello: "world" };

  const WrappedValue = wrap(arbitraryValue);

  @injectable([WrappedValue, wrap(arbitraryValue)])
  class MyClass {
    constructor(
      public wrappedValue: Wrapped<typeof arbitraryValue>,
      public wrappedValue2: Wrapped<typeof arbitraryValue>,
    ) {}
  }

  const instance = resolve(MyClass);

  assertStrictEquals(arbitraryValue, instance.wrappedValue.value);
  assertStrictEquals(arbitraryValue, instance.wrappedValue2.value);
  assertStrictEquals(arbitraryValue, unwrap(WrappedValue));
});
