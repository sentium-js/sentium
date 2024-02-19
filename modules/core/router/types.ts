import { Interceptable } from "../method/interceptor/types.ts";
import { Middleware } from "../middleware/types.ts";
import { Class, Method } from "../utils/types.ts";

export type MatchParams = Record<string, string>;

export type Handler = MethodHandler | MiddlewareHandler;

export type MethodHandler = {
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
  target: Method;

  /**
   * The controller that the handler is a method of.
   */
  controller: Class;

  /**
   * The interceptors that should be called before the method handler.
   */
  interceptors: Class<any[], Interceptable>[];
};

export type MiddlewareHandler = {
  type: "middleware";

  /**
   * The path to match.
   */
  path: string;

  /**
   * The priority of the handler.
   *
   * Higher priority middleware handlers are called first.
   */
  priority: number;

  /**
   * The middleware handler to call if the path matches.
   */
  target: Class<any[], Middleware>;
};

export type MatchResult = {
  /**
   * The middleware handlers that matched in the right order.
   */
  middlewares: HandlerMatch<MiddlewareHandler>[];

  /**
   * The matched handler with the highest priority.
   */
  method?: HandlerMatch<MethodHandler>;
};

export type HandlerMatch<T extends Handler = Handler> = {
  /**
   * The handler that matched.
   */
  handler: T;

  /**
   * The parameters that were extracted from the path of the handler.
   */
  params: MatchParams;
};
