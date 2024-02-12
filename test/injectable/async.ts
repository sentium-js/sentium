import {
  assertInstanceOf,
  assertEquals,
  assertThrows,
  assertStrictEquals,
} from 'std/assert/mod.ts';
import { injectable, resolveAsync, resolve, preload } from '../../modules/injectable/mod.ts';

Deno.test('class with async initializer', async () => {
  @injectable([], async () => {
    // simulate async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new MyAsyncClass('Hello');
  })
  class MyAsyncClass {
    constructor(public awaitedValue: string) {}
  }

  const instance = await resolveAsync(MyAsyncClass);

  assertInstanceOf(instance, MyAsyncClass);
  assertEquals(instance.awaitedValue, 'Hello');
});

Deno.test('class with async injects and initializer', async () => {
  @injectable([], async () => {
    // simulate async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new MyDependency('World');
  })
  class MyDependency {
    constructor(private awaitedWorld: string) {}

    getWorld() {
      return this.awaitedWorld;
    }
  }

  @injectable([MyDependency], async (dep: MyDependency) => {
    // simulate async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new MyAsyncClass(dep.getWorld());
  })
  class MyAsyncClass {
    constructor(private worldName: string) {}

    getHelloWorld() {
      return `Hello ${this.worldName}`;
    }
  }

  assertThrows(() => {
    // this should throw because the async initializer can not be resolved syncronously
    resolve(MyAsyncClass);
  });

  const instance = await resolveAsync(MyAsyncClass);

  // now the async injectable can be resolved syncronously because it was initialized in a previous step
  const instanceSync = resolve(MyAsyncClass);

  assertInstanceOf(instance, MyAsyncClass);
  assertInstanceOf(instanceSync, MyAsyncClass);

  // it should be the same instance
  assertStrictEquals(instance, instanceSync);
  assertStrictEquals(instance.getHelloWorld(), 'Hello World');
  assertStrictEquals(instanceSync.getHelloWorld(), 'Hello World');
});

Deno.test('class with async initializer and multiple resolves', async () => {
  @injectable([], async () => {
    // simulate async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new MyClass();
  })
  class MyClass {
    getHello() {
      return 'Hello';
    }
  }

  const instance = await resolveAsync(MyClass);
  const instance2 = await resolveAsync(MyClass);

  assertInstanceOf(instance, MyClass);
  assertInstanceOf(instance2, MyClass);

  assertStrictEquals(instance, instance2);
});

Deno.test('class with async initializer and multiple resolves (sync and async)', async () => {
  let initialized = false;

  @injectable([], async () => {
    // ensure the initializer is only called once
    assertStrictEquals(initialized, false);

    initialized = true;

    // simulate async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new MyClass();
  })
  class MyClass {
    constructor() {}

    getHello() {
      return 'Hello';
    }
  }

  // this should trigger the async initializer

  assertStrictEquals(initialized, false);

  assertThrows(() => {
    const _instance = resolve(MyClass);
  });

  assertStrictEquals(initialized, true);

  const instance = await resolveAsync(MyClass);

  const instanceSync = resolve(MyClass);

  assertInstanceOf(instance, MyClass);
  assertInstanceOf(instanceSync, MyClass);

  assertStrictEquals(instance, instanceSync);
});

Deno.test('class with async initializer and preload', async () => {
  @injectable([], async () => {
    // simulate async initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    return new MyClass();
  })
  class MyClass {
    getHello() {
      return 'Hello';
    }
  }

  // preload the injectable and await it
  await preload([MyClass]);

  // now the async injectable can be resolved syncronously
  const instance = resolve(MyClass);

  assertInstanceOf(instance, MyClass);
  assertEquals(instance.getHello(), 'Hello');
});

Deno.test(
  {
    name: 'class with async initializer, preload and custom scope',

    /**
     * This option is needed because a sync resolve on a async injectable triggers
     * the async initializer function and throw an error.
     *
     * This is not a problem because the async initializer is only called once and
     * after the async initializer resolves the instance is cached for later sync/async resolves.
     */
    sanitizeOps: false,
  },
  async () => {
    @injectable([], async () => {
      // simulate async initialization
      await new Promise((resolve) => setTimeout(resolve, 100));
      return new MyClass();
    })
    class MyClass {
      getHello() {
        return 'Hello';
      }
    }

    assertThrows(() => {
      // this should throw because at this moment the instance is initialized.
      resolve(MyClass, 'custom preload scope');
    });

    // preload the injectable with custom scope and await it
    await preload([MyClass], 'custom preload scope');

    assertThrows(() => {
      // this should throw because the preload scope is not the same as the resolve scope
      resolve(MyClass);
    });

    // now the async injectable can be resolved syncronously with the correct scope
    const instance = resolve(MyClass, 'custom preload scope');
    assertInstanceOf(instance, MyClass);
    assertEquals(instance.getHello(), 'Hello');
  }
);
