import { ControllerManager } from "../controller/manager.ts";
import { Logger } from "../logger/logger.ts";
import { ApplicationOptions, PreloadReturn } from "./types.ts";
import { LogColor } from "../logger/colors.ts";
import { Interceptable } from "../method/interceptor/types.ts";
import { Router } from "../router/router.ts";
import { executeHandlers } from "../execution/execution.ts";
import { Middleware } from "../middleware/types.ts";
import { joinPaths } from "../router/utils.ts";
import { ErrorHandler, NotFoundHandler } from "../execution/types.ts";
import { DefaultHandler } from "./default_handler.ts";
import { Class } from "../utils/types.ts";
import { InjectableScope } from "../injectable/types.ts";
import {
  preload as preloadInjectables,
  resolve,
} from "../injectable/resolver.ts";
import {
  defaultInjectableScope,
  InjectableManager,
} from "../injectable/manager.ts";

export class Application {
  private readonly router: Router;
  private readonly scope: InjectableScope;
  private readonly preloaded: boolean;
  private readonly logger: Logger;
  private readonly interceptors: Class<any, Interceptable>[];
  private readonly notFoundHandler: Class<any, NotFoundHandler>;
  private readonly errorHandler: Class<any, ErrorHandler>;
  private preloadPromise: Promise<void> | undefined;

  constructor(
    options: ApplicationOptions = {},
  ) {
    this.scope = options.scope ?? defaultInjectableScope;
    this.logger = resolve(Logger, this.scope);
    this.preloaded = options.preload ?? false;
    this.interceptors = options.interceptors ?? [];
    this.notFoundHandler = options.notFoundHandler ?? DefaultHandler;
    this.errorHandler = options.errorHandler ?? DefaultHandler;

    if (options.logger) this.logger.send = options.logger;
    // set logger to noop if false is provided
    else if (options.logger === false) this.logger.send = () => {};

    this.logger.info(
      "App",
      "Starting application...",
    );
    this.logger.debug(
      "App",
      "Scope:",
      this.scope === defaultInjectableScope
        ? LogColor.fg.black + "default" + LogColor.reset
        : this.scope,
    );
    this.logger.debug("App", "Preload:", this.preloaded);

    this.router = new Router(this.scope);

    // if preload is enabled and controllers are provided preload all controllers
    if (this.preloaded && options.controllers) {
      this.logger.info(
        "App",
        `Preloading ${options.controllers.length} controllers...`,
      );
      this.preloadPromise = preloadInjectables(options.controllers, this.scope)
        .then(() => this.logger.info("App", "Preloading finished."));
    }

    // register controllers
    options.controllers?.forEach((controller) =>
      this.registerController(controller, false)
    );

    // register middlewares
    options.middlewares?.forEach((middleware) =>
      this.registerMiddleware(middleware, "*", false)
    );
  }

  /**
   * Resolve when the router is ready to handle incoming requests.
   *
   * If preload is enabled this promise resolves when all controllers
   * are preloaded otherwise it resolves immediately.
   */
  get ready(): Promise<void> {
    return this.preloadPromise ?? Promise.resolve();
  }

  /**
   * Handle the incoming request and return the response.
   *
   * @param request The incoming request.
   * @param env Optional environment variables which will be available in the execution context.
   * @returns The response of the request.
   */
  async fetch<Req extends Request>(
    request: Req,
    env?: unknown,
  ): Promise<Response> {
    const url = new URL(request.url);

    // get the handler matches from the router
    const matches = this.router.match(request.method, url.pathname);

    // execute the handlers
    const response = await executeHandlers({
      request,
      env,
      matches,
      scope: this.scope,
      notFoundHandler: this.notFoundHandler,
      errorHandler: this.errorHandler,
    });

    // return the response
    return response;
  }

  /**
   * Register a controller to the application.
   *
   * @param controllerClass The controller class to register.
   * @param preload If true the controller with dependecies will be preloaded, otherwise not.
   * @returns If preload is true the return value is a promise which resolves when the controller is preloaded, otherwise void.
   */
  registerController<Preload extends boolean>(
    controllerClass: Class,
    preload: Preload = false as Preload,
  ): PreloadReturn<Preload> {
    this.logger.info(
      "App",
      `Registering controller: ${
        LogColor.fg.black + controllerClass.name + LogColor.reset
      }`,
    );
    const controller = new ControllerManager(controllerClass);

    // check if the class is declared as controller
    if (!controller.declared) {
      throw new Error(
        `Failed to register controller: ${controllerClass.name} is not declared as controller`,
      );
    }

    controller.getHandlers(this.interceptors).forEach((handler) =>
      this.router.add(handler)
    );

    return (preload
      ? preloadInjectables([controllerClass], this.scope)
      : undefined) as PreloadReturn<Preload>;
  }

  /**
   * Register a middleware to the application.
   *
   * @param middlewareClass The middleware class to register (injectable which implements Middleware).
   * @param path The path where the middleware should be registered. Default is "*".
   * @param preload If true the middleware with dependecies will be preloaded, otherwise not.
   * @returns If preload is true the return value is a promise which resolves when the middleware is preloaded, otherwise void.
   */
  registerMiddleware<Preload extends boolean>(
    middlewareClass: Class<any[], Middleware>,
    path = "*",
    preload: Preload = false as Preload,
  ): PreloadReturn<Preload> {
    const correctPath = joinPaths(path);

    this.logger.info(
      "App",
      `Registering middleware: ${
        LogColor.fg.black + middlewareClass.name + LogColor.reset
      } at ${LogColor.fg.magenta + correctPath + LogColor.reset}`,
    );
    const middleware = new InjectableManager(middlewareClass);

    // check if the class is declared as injectable
    if (!middleware.declared) {
      throw new Error(
        `Failed to register middleware: ${middlewareClass.name} is not declared as injectable`,
      );
    }

    // check if the class has a handle method
    if (!middlewareClass.prototype.handle) {
      throw new Error(
        `Failed to register middleware: ${middlewareClass.name} does not have a handle method`,
      );
    }

    this.router.add({
      type: "middleware",
      path: correctPath,
      // TODO make priority configurable
      priority: 0,
      target: middlewareClass,
    });

    return (preload
      ? preloadInjectables([middlewareClass], this.scope)
      : undefined) as PreloadReturn<Preload>;
  }
}
