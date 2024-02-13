/**
 * Type representation of a class.
 */
export type Class<
  Args extends readonly any[] = any[],
  Return extends any = any,
> = new (
  ...args: Args
) => Return;

/**
 * Type representation of a function.
 */
export type Method<
  This extends any = any,
  Args extends readonly any[] = any[],
  Return extends any = any,
> = (this: This, ...args: Args) => Return;

/**
 * Type which can be a value or a promise of a value.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Return the instance types of the given classes.
 *
 * Same as `InstanceType` but for multiple classes.
 */
export type InstanceTypes<Classes extends readonly Class[]> = {
  readonly [Index in keyof Classes]: Classes[Index] extends
    Class<infer _, infer Return> ? Return
    : never;
};
