import { MethodMetadata } from "./types.ts";
import { Interceptable } from "./interceptor/types.ts";
import { MethodHandler } from "../router/types.ts";
import { Handler } from "../router/types.ts";
import { Middleware } from "../middleware/types.ts";
import { MiddlewareHandler } from "../router/types.ts";
import { joinPaths } from "../router/utils.ts";
import { Class, Method } from "../utils/types.ts";
import { Metadata } from "../metadata/metadata.ts";

export const METHOD_METADATA_KEY = Symbol.for("sentium.method");

export const defaultMethodMeta: MethodMetadata = {
  method: "GET",
  path: "/",
  priority: 0,

  params: [],
  interceptors: [],
  middlewares: [],
};

export class MethodManager<Target extends Method> {
  constructor(private readonly target: Target) {}

  /**
   * Returns `true` if the class is declared as controller. Otherwise `false`.
   */
  get declared(): boolean {
    return Metadata.get(this.target, METHOD_METADATA_KEY) !== undefined;
  }

  /**
   * Returns the metadata of the controller class or throws an error if the class is not declared as controller.
   */
  private get metadata(): MethodMetadata {
    const meta = Metadata.get<MethodMetadata>(
      this.target,
      METHOD_METADATA_KEY,
    );

    if (!meta) {
      throw new Error(
        `Failed to access metadata of a non-controlled method: ${this.target.name}`,
      );
    }

    return meta;
  }

  private set metadata(meta: MethodMetadata) {
    Metadata.set(this.target, METHOD_METADATA_KEY, meta);
  }

  get method(): string {
    return this.metadata.method;
  }

  get path(): string {
    return this.metadata.path;
  }

  get priority(): number {
    return this.metadata.priority;
  }

  get params() {
    return this.metadata.params;
  }

  get interceptors(): Class<any, Interceptable>[] {
    return this.metadata.interceptors;
  }

  get middlewares(): Class<any, Middleware>[] {
    return this.metadata.middlewares;
  }

  /**
   * Declare the method with the given options.
   *
   * @param options Options for the method.
   */
  declare(options: Partial<MethodMetadata>): void {
    // if the class is not declared yet, create the metadata with the default values and the given options
    if (!this.declared) {
      this.metadata = { ...defaultMethodMeta, ...options };
      return;
    }

    // merge the options with the existing metadata
    this.metadata = { ...this.metadata, ...options };
  }

  getHandlers(
    basePath: string,
    controller: Class,
    externalInterceptors: Class<any[], Interceptable>[],
  ): Handler[] {
    // create the method handler
    const methodHandler: MethodHandler = {
      type: "method",

      method: this.method,
      path: joinPaths(basePath, this.path),
      priority: this.priority,

      target: this.target,

      interceptors: [...externalInterceptors, ...this.interceptors],
      controller,
    };

    // create the middleware handlers
    const middlewareHandlers = this.middlewares.map<MiddlewareHandler>((
      middleware,
    ) => ({
      type: "middleware",
      // the middleware use exactly the same path as the method
      path: methodHandler.path,
      // TODO make the priority configurable
      priority: 0,
      target: middleware,
    }));

    return [methodHandler, ...middlewareHandlers];
  }
}
