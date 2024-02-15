import { Class, Method } from "../../common/mod.ts";
import { ControllerManager } from "../controller/manager.ts";
import { MethodManager } from "../method/manager.ts";
import { Middleware } from "./types.ts";

/**
 * Set middlewares for a controller or method.
 *
 * The order of the middlewares are important. The first middleware
 * will be executed first and the last middleware will be executed last.
 *
 * If this decorator is used multiple times, the middlewares will be overwritten,
 * so only use this decorator once per class or method.
 *
 * @param middlewares Middleware classes to be used.
 */
export const use =
  (...middlewares: Class<any, Middleware>[]) =>
  <Target extends Class | Method>(
    target: Target,
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
  ) => {
    switch (context.kind) {
      case "class": {
        new ControllerManager(target as Class).declare({ middlewares });
        break;
      }
      case "method": {
        new MethodManager(target as Method).declare({ middlewares });
        break;
      }
    }
  };
