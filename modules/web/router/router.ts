import { Class } from "../../common/mod.ts";
import {
  defaultInjectableScope,
  InjectableScope,
} from "../../injectable/mod.ts";
import { resolve } from "../../injectable/resolver.ts";
import { ControllerManager } from "../controller/manager.ts";
import { Adapter } from "../handler/adapter.ts";
import { HttpResponse } from "../handler/context.ts";
import { HttpRequest } from "../handler/context.ts";
import { ExecutionContext } from "../handler/context.ts";

export class Router<A extends Adapter> {
  constructor(
    public readonly adapter: A,
    controllers: Class[] = [],
    private scope: InjectableScope = defaultInjectableScope,
  ) {
    // register all controllers
    controllers.forEach((controller) => this.registerController(controller));
  }

  /**
   * The handle which the adapter provides to start listening for incoming requests.
   */
  get handle(): A["handle"] {
    return this.adapter.handle;
  }

  private registerController(target: Class) {
    const controller = new ControllerManager(target);

    // check if the class is declared as controller
    if (!controller.declared) {
      throw new Error(
        `Failed to register controller: ${target.name} is not declared as controller`,
      );
    }

    const instance = resolve(target, this.scope);

    for (const info of controller.getHandlerInfo(instance)) {
      if (info.type === "method") {
        this.adapter.registerMethod(
          info.method,
          info.path,
          info.handler,
          this.getExectionContext.bind(this),
        );
      } else if (info.type === "middleware") {
        this.adapter.registerMiddleware(
          info.path,
          info.handler,
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

      // initialize an empty meta map
      meta: new Map(),
    };

    return ctx;
  }
}
