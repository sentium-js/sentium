import { Class } from '../common/mod.ts';
import { InjectableManager } from './manager.ts';
import { InjectableScope } from './types.ts';

/**
 * Syncronously resolves an injectable class with the given scope.
 *
 * @param target The injectable class to resolve.
 * @param scope Optional scope for the resolution.
 * @returns The resolved instance of the injectable class for the given scope.
 */
export const resolve = <const Target extends Class>(
  target: Target,
  scope?: InjectableScope
): InstanceType<Target> => {
  return new InjectableManager(target).resolve(scope);
};

/**
 * Asynchronously resolves an injectable class with the given scope.
 *
 * @param target The injectable class to resolve.
 * @param scope Optional scope for the resolution.
 * @returns A promise of the resolved instance of the injectable class for the given scope.
 */
export const resolveAsync = <const Target extends Class>(
  target: Target,
  scope?: InjectableScope
): Promise<InstanceType<Target>> => {
  return new InjectableManager(target).resolveAsync(scope);
};

/**
 * Preloads the given injectable classes with the given scope to syncronously resolve them later.
 * This is only useful for injectables with async initializers.
 *
 * This is only syntactic sugar for
 * ```typescript
 * Promise.all(targets.map((target) => resolveAsync(target, scope))
 * ```
 *
 * @example ```typescript
 *
 *   // any injectable with async initializer
 *   class MyAsyncClass { ... }
 *
 *   // preload the injectable and await it
 *   await preload([MyAsyncClass]);
 *
 *   // now the async injectable can be resolved syncronously
 *   const instance = resolve(MyAsyncClass);
 *
 * ```
 *
 * @param targets An array of injectable classes to preload.
 * @param scope Optional scope for the resolution.
 */
export const preload = async (targets: Class[], scope?: InjectableScope): Promise<void> => {
  await Promise.all(targets.map((target) => resolveAsync(target, scope)));
};
