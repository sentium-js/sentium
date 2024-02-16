import { Class } from "../../common/mod.ts";
import { InjectableManager } from "../../injectable/mod.ts";
import { ErrorHandler, NotFoundHandler } from "./types.ts";

/**
 * A shortcut to create a not found handler class.
 *
 * With this shortcut, there is no way to inject dependencies into the handler.
 * If you need to inject dependencies, you should create the handler class manually.
 *
 * @param onNotFound The onNotFound method of the handler.
 * @returns The not found handler class which implements the `NotFoundHandler` interface.
 */
export const createNotFoundHandler = (
  onNotFound: NotFoundHandler["onNotFound"],
): Class<[], NotFoundHandler> => {
  // create the handler class.
  const handler = class implements NotFoundHandler {
    // the handle method of the handler.
    onNotFound = onNotFound;
  };

  // declare the handler as injectable.
  new InjectableManager(handler).declare([]);

  return handler;
};

/**
 * A shortcut to create a error handler class.
 *
 * With this shortcut, there is no way to inject dependencies into the handler.
 * If you need to inject dependencies, you should create the handler class manually.
 *
 * @param onError The onError method of the handler.
 * @returns The error handler class which implements the `ErrorHandler` interface.
 */
export const createErrorHandler = (
  onError: ErrorHandler["onError"],
): Class<[], ErrorHandler> => {
  // create the handler class.
  const handler = class implements ErrorHandler {
    // the handle method of the handler.
    onError = onError;
  };

  // declare the handler as injectable.
  new InjectableManager(handler).declare([]);

  return handler;
};
