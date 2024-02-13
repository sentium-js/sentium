import { Class, Method } from "../../../common/mod.ts";
import { Interceptable } from "./types.ts";
import { ControllerManager } from "../../controller/manager.ts";
import { MethodManager } from "../manager.ts";

/**
 * Set interceptors for a controller or method to be executed before the handler.
 *
 * That the order of the interceptors is important. The first interceptor
 * will be executed first and the last interceptor will be executed last.
 *
 * If this decorator is used multiple times, the interceptors will be overwritten,
 * so only use this decorator once per class or method.
 *
 * @param interceptors Interceptor classes to be executed before the handler.
 */
export const intercept =
  (...interceptors: Class<any, Interceptable>[]) =>
  <Target extends Class | Method>(
    target: Target,
    context: ClassDecoratorContext | ClassMethodDecoratorContext,
  ) => {
    switch (context.kind) {
      case "class": {
        new ControllerManager(target as Class).declare({ interceptors });
        break;
      }
      case "method": {
        new MethodManager(target as Method).declare({ interceptors });
        break;
      }
    }
  };
