import { injectable, resolve } from '@sentium/injectable';
import { assertInstanceOf, assertNotStrictEquals, assertStrictEquals } from 'std/assert/mod.ts';

Deno.test('class instance with different scopes', () => {
  @injectable()
  class MyClass {
    getHello() {
      return 'Hello';
    }
  }

  const instanceDefaultScope = resolve(MyClass);
  const instanceCustomScope = resolve(MyClass, 'Hello I am a custom string scope');

  assertInstanceOf(instanceDefaultScope, MyClass);
  assertInstanceOf(instanceCustomScope, MyClass);

  // instances should not be the same because of different scopes
  assertNotStrictEquals(instanceDefaultScope, instanceCustomScope);

  // both instances should return the same value
  assertStrictEquals(instanceDefaultScope.getHello(), 'Hello');
  assertStrictEquals(instanceCustomScope.getHello(), 'Hello');
});

Deno.test('class instance with same scopes', () => {
  @injectable()
  class MyClass {
    getHello() {
      return 'Hello';
    }
  }

  const instanceCustomScope = resolve(MyClass, 'Hello I am a custom string scope');
  const instanceCustomScopeToo = resolve(MyClass, 'Hello I am a custom string scope');

  assertInstanceOf(instanceCustomScope, MyClass);
  assertInstanceOf(instanceCustomScopeToo, MyClass);

  // instances should not be the same because of different scopes
  assertStrictEquals(instanceCustomScope, instanceCustomScopeToo);

  // both instances should return the same value
  assertStrictEquals(instanceCustomScope.getHello(), 'Hello');
  assertStrictEquals(instanceCustomScopeToo.getHello(), 'Hello');
});
