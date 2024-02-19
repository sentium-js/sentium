import { InjectableManager } from "../injectable/manager.ts";
import { Class } from "../utils/types.ts";
import { Middleware } from "./types.ts";

/**
 * A shortcut to create a middleware class with a given handle method.
 *
 * With this shortcut, there is no way to inject dependencies into the middleware.
 * If you need to inject dependencies, you should create the middleware class manually.
 *
 * @param handle The handle method of the middleware.
 * @returns The middleware class which implements the `Middleware` interface.
 */
export const createMiddleware = (
  handle: Middleware["handle"],
): Class<[], Middleware> => {
  // create the middleware class.
  const middleware = class implements Middleware {
    // the handle method of the middleware.
    handle = handle;
  };

  // declare the middleware as injectable.
  new InjectableManager(middleware).declare([]);

  return middleware;
};
