import { Class } from "../../common/mod.ts";
import {
  defaultInjectableScope,
  InjectableScope,
  preload,
  resolve,
} from "../../injectable/mod.ts";
import { ControllerManager } from "../controller/manager.ts";
import { Adapter } from "../handler/adapter.ts";
import { HttpResponse } from "../handler/context.ts";
import { HttpRequest } from "../handler/context.ts";
import { ExecutionContext } from "../handler/context.ts";
import { Logger } from "../logger/logger.ts";
import { RouterOptions } from "./types.ts";
import { LogColor } from "../logger/colors.ts";
import { Interceptable } from "../method/interceptor/types.ts";

export class Router<A extends Adapter> {
  private readonly adapter: A;
  private readonly scope: InjectableScope;
  private readonly preloaded: boolean;
  private readonly logger: Logger;
  private readonly interceptors: Class<any, Interceptable>[];
  private preloadPromise: Promise<void> | undefined;

  constructor(
    options: RouterOptions<A>,
  ) {
    this.adapter = options.adapter;
    this.scope = options.scope ?? defaultInjectableScope;
    this.preloaded = options.preload ?? false;
    this.interceptors = options.interceptors ?? [];
    this.logger = resolve(Logger, this.scope);

    if (options.logger) this.logger.send = options.logger;

    this.logger.info(
      "Router",
      "Starting router...",
    );

    this.logger.debug("Router", "Adapter:", this.adapter.constructor.name);
    this.logger.debug(
      "Router",
      "Scope:",
      this.scope === defaultInjectableScope
        ? LogColor.fg.black + "default" + LogColor.reset
        : this.scope,
    );
    this.logger.debug("Router", "Preload:", this.preloaded);

    // if preload is enabled and controllers are provided preload all controllers
    if (this.preloaded && options.controllers) {
      this.logger.info(
        "Router",
        `Preloading ${options.controllers.length} controllers...`,
      );
      this.preloadPromise = preload(options.controllers, this.scope).then(() =>
        this.logger.info("Router", "Preloading finished.")
      );
    }

    // register controllers
    options.controllers?.forEach((controller) =>
      this.registerController(controller)
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
   * The handle which the adapter provides to start listening for incoming requests.
   */
  get handle(): A["handle"] {
    return this.adapter.handle;
  }

  private registerController(target: Class) {
    this.logger.info("Router", `Registering controller: ${target.name}`);
    const controller = new ControllerManager(target);

    // check if the class is declared as controller
    if (!controller.declared) {
      throw new Error(
        `Failed to register controller: ${target.name} is not declared as controller`,
      );
    }

    for (const info of controller.getHandlerInfo(this.interceptors)) {
      if (info.type === "method") {
        this.logger.info(
          `Controller/${target.name}`,
          `Registering method: ${info.method} ${info.path}`,
        );
        this.adapter.registerMethod(
          info.method,
          info.path,
          info.handler,
          // TODO include method and controller into the context
          // this is useful when middlewares extract metadata from the handlers to determine if the request should pass for example (auth)
          this.getExectionContext.bind(this),
        );
      } else if (info.type === "middleware") {
        this.logger.info(
          `Controller/${target.name}`,
          `Registering middleware: ${info.path}`,
        );
        this.adapter.registerMiddleware(
          info.path,
          info.handler,
          // TODO include method and controller into the context (same as above)
          this.getExectionContext.bind(this),
        );
      }
    }
  }

  private getExectionContext(
    current: ExecutionContext | undefined,
    req: Request,
    params: Record<string, string>,
    env: unknown,
  ): ExecutionContext {
    // for now just return the current context if present
    if (current) return current;

    // create a new context
    const ctx: ExecutionContext = {
      // create a http request from the raw request and the url params
      req: new HttpRequest(req, params),

      // initialize a new http response
      res: new HttpResponse(),

      // passthrough the environment variables
      env,

      // initialize an empty data map
      data: new Map(),

      // the injection scope the router was created with
      scope: this.scope,

      // passthrough the logger
      logger: this.logger,
    };

    return ctx;
  }
}
