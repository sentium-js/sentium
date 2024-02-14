import { Class, Method } from "../../common/mod.ts";
import { Middleware } from "../middleware/types.ts";

export type HandlerInfo = MethodHandlerInfo | MiddlewareHandlerInfo;

export type MethodHandlerInfo = {
  type: "method";

  /**
   * The HTTP method to match.
   */
  method: string;

  /**
   * The path to match.
   */
  path: string;

  /**
   * The priority of the handler.
   *
   * If multiple method handlers match, the one with the highest priority is called.
   */
  priority: number;

  /**
   * The method handler to call if the method and path match.
   */
  handler: Method;

  /**
   * The controller that the handler is a method of.
   */
  controller: Class;
};

export type MiddlewareHandlerInfo = {
  type: "middleware";

  /**
   * The path to match.
   */
  path: string;

  /**
   * The order the handler should be called in. Lower numbers are called first.
   */
  order: number;

  /**
   * The middleware handler to call if the path matches.
   */
  handler: Class<any[], Middleware>;
};

export type MatchResult = {
  /**
   * The middleware handlers that matched in the right order.
   */
  middleware: Class<any[], Middleware>[];

  /**
   * The matched handler with the highest priority.
   *
   * If no handler matches, this is undefined. (404)
   */
  method?: {
    /**
     * The method handler that matched.
     */
    handler: Method;

    /**
     * The controller that the handler is a method of.
     */
    controller: Class;
  };
};
