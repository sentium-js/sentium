import { Class, InstanceTypes, MaybePromise } from "../utils/types.ts";

/**
 * Type of the scope for the injectable class.
 * This can be any string, number or symbol.
 */
export type InjectableScope = string | number | symbol;

/**
 * Type of the initializer function for the injectable class.
 */
export type InjectableInitializer<Args extends readonly any[], ReturnType> = (
  ...args: Args
) => MaybePromise<ReturnType>;

/**
 * Type of the injectable class based on the given injectable initializer.
 *
 * If the initializer is **not** provided, the class constructor need to implement the injects.
 *
 * If the initializer is provided, the class constructor can have any arguments
 * because the inects gets injected to the the initializer.
 */
export type InjectableTarget<
  Injects extends readonly Class[],
  Init extends InjectableInitializer<any, any> | undefined,
> = Init extends undefined ? Class<InstanceTypes<Injects>> : Class;

export type InjectableMetadata<
  Target extends Class = Class,
  Injects extends readonly Class[] = readonly Class[],
> = {
  // runtime data
  instances: Map<InjectableScope, InstanceType<Target>>;
  asyncResolves: Map<InjectableScope, Promise<InstanceType<Target>>>;

  // static options
  injects: Injects;
  initializer:
    | InjectableInitializer<InstanceTypes<Injects>, InstanceType<Target>>
    | undefined;
};
