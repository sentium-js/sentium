import { Class, InstanceTypes } from '@sentium/common';
import { InjectableInitializer, InjectableTarget } from './types.ts';
import { InjectableManager } from './manager.ts';

/**
 * Decorator for declaring the class as injectable.
 *
 * @param inject
 * Optional list of classes to inject into the class. All injects must also be declared as injectable.
 *
 * @param initialize
 * Optional initializer for the class. If provided, the class constructor can have any arguments because the injects gets injected to the the initializer.
 * The initializer can be asyncronous and can return a promise of the class instance. For asyncronous initializers, the class must be resolved with `resolveAsync` or `preload` before using it.
 */
export const injectable =
  <
    const Target extends InjectableTarget<Inject, Init>,
    const Inject extends readonly Class[] = readonly [],
    const Init extends
      | InjectableInitializer<InstanceTypes<Inject>, InstanceType<Target>>
      | undefined = undefined
  >(
    inject: Inject = [] as unknown as Inject,
    initialize: Init = undefined as Init
  ) =>
  (target: Target, _context: ClassDecoratorContext<Target>) =>
    new InjectableManager(target).declare(inject, initialize);
