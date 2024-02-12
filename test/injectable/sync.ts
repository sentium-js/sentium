import { assertInstanceOf, assertEquals } from 'std/assert/mod.ts';
import { injectable, resolve } from '../../modules/injectable/mod.ts';

Deno.test('basic class', () => {
  @injectable()
  class MyClass {
    getHello() {
      return 'Hello';
    }
  }

  const instance = resolve(MyClass);

  assertInstanceOf(instance, MyClass);
  assertEquals(instance.getHello(), 'Hello');
});

Deno.test('class with injects', () => {
  @injectable()
  class MyDependency {
    getWorld() {
      return 'World';
    }
  }

  @injectable([MyDependency])
  class MyClass {
    constructor(public dependency: MyDependency) {}

    getHelloWorld() {
      return `Hello ${this.dependency.getWorld()}`;
    }
  }

  const instance = resolve(MyClass);

  assertInstanceOf(instance, MyClass);
  assertInstanceOf(instance.dependency, MyDependency);
  assertEquals(instance.getHelloWorld(), 'Hello World');
});

Deno.test('class with initializer', () => {
  @injectable([], () => new MyClass('Hello'))
  class MyClass {
    constructor(private hello: string) {}

    getHello() {
      return this.hello;
    }
  }

  const instance = resolve(MyClass);

  assertInstanceOf(instance, MyClass);
  assertEquals(instance.getHello(), 'Hello');
});

Deno.test('class with injects and initializer', () => {
  @injectable()
  class MyDependency {
    getWorld() {
      return 'World';
    }
  }

  @injectable()
  class MyOtherDependency {
    getHello() {
      return 'Hello';
    }
  }

  @injectable([MyDependency, MyOtherDependency])
  class MyClass {
    constructor(public dep1: MyDependency, public dep2: MyOtherDependency) {}

    getHelloWorld() {
      return `${this.dep2.getHello()} ${this.dep1.getWorld()}`;
    }
  }

  const instance = resolve(MyClass);

  assertInstanceOf(instance, MyClass);
  assertInstanceOf(instance.dep1, MyDependency);
  assertInstanceOf(instance.dep2, MyOtherDependency);
  assertEquals(instance.getHelloWorld(), 'Hello World');
});
