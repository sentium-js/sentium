import { Class } from "../../common/mod.ts";
import { InjectableScope } from "../../injectable/mod.ts";
import { LogFunction } from "../logger/logger.ts";
import { Interceptable } from "../method/interceptor/types.ts";
import { Middleware } from "../middleware/types.ts";
import { ErrorHandler, NotFoundHandler } from "../execution/types.ts";

export type ApplicationOptions = {
  /**
   * List of controllers which should be registered on startup.
   */
  controllers?: Class[];

  /**
   * The scope which is used to resolve dependencies.
   */
  scope?: InjectableScope;

  /**
   * Preload all controllers with their dependecies on startup.
   *
   * If enabled (`true`): All controllers (and their dependencies)
   * are preloaded on startup which leads to a faster response time
   * on the first request but a longer startup time of the server.
   * *Recommanded for long-running servers like a dedicated node.js process.*
   *
   * If disabled (`false`): Controllers and their dependencies
   * are loaded on the first request which leads to a slower response time
   * on the first request but a faster startup time of the server.
   * Benefit: Controllers and their dependencies which are not used are not loaded at all.
   * *Recommanded for short-running servers like a serverless function.*
   *
   * @default false
   */
  preload?: boolean;

  /**
   * Provide a custom logger function for the router.
   */
  logger?: LogFunction | false;

  /**
   * List of interceptors which should be registered as global interceptors.
   */
  interceptors?: Class<any, Interceptable>[];

  /**
   * List of middlewares which should be registered as global middlewares.
   */
  middlewares?: Class<any, Middleware>[];

  /**
   * The not found handler which should be called if no handler matches the request.
   */
  notFoundHandler?: Class<any, NotFoundHandler>;

  /**
   * The error handler which should be called if an error occurs during request handling.
   */
  errorHandler?: Class<any, ErrorHandler>;
};

export type PreloadReturn<Preload extends boolean> = Preload extends true
  ? Promise<void>
  : void;
