import { InjectableManager } from "../../injectable/manager.ts";
import { Class } from "../../utils/types.ts";
import { Interceptable } from "./types.ts";

/**
 * A shortcut to create an interceptor class with a given intercept method.
 *
 * With this shortcut, there is no way to inject dependencies into the interceptor.
 * If you need to inject dependencies, you should create the interceptor class manually.
 *
 * @param intercept The intercept method of the interceptor.
 * @returns The interceptor class which implements the `Interceptable` interface.
 */
export const createInterceptor = (
  intercept: Interceptable["intercept"],
): Class<[], Interceptable> => {
  // create the interceptor class.
  const interceptor = class implements Interceptable {
    // the intercept method of the interceptor.
    intercept = intercept;
  };

  // declare the interceptor as injectable.
  new InjectableManager(interceptor).declare([]);

  return interceptor;
};
