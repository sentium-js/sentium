import { Class } from "../../common/mod.ts";
import { InjectableManager } from "../../injectable/mod.ts";
import { Metadata } from "../../metadata/mod.ts";
import { ControllerMetadata } from "./types.ts";
import { MethodManager } from "../method/manager.ts";
import { Interceptable } from "../method/interceptor/types.ts";
import { Handler, MiddlewareHandler } from "../router/types.ts";
import { Middleware } from "../middleware/types.ts";
import { createWildcardPath } from "../router/utils.ts";

export const CONTROLLER_METADATA_KEY = Symbol.for("sentium.controller");

export const defaultControllerMeta: ControllerMetadata = {
  path: "/",
  interceptors: [],
  middlewares: [],
};

export class ControllerManager<Target extends Class> {
  private readonly injectable: InjectableManager<Target>;

  constructor(private readonly target: Target) {
    this.injectable = new InjectableManager(target);
  }

  /**
   * Returns `true` if the class is declared as controller. Otherwise `false`.
   */
  get declared(): boolean {
    return Metadata.get(this.target, CONTROLLER_METADATA_KEY) !== undefined;
  }

  /**
   * Returns the metadata of the controller class or throws an error if the class is not declared as controller.
   */
  private get metadata(): ControllerMetadata {
    const meta = Metadata.get<ControllerMetadata>(
      this.target,
      CONTROLLER_METADATA_KEY,
    );

    if (!meta) {
      throw new Error(
        `Failed to access metadata of a non-controller class: ${this.target.name}`,
      );
    }

    return meta;
  }

  private set metadata(meta: ControllerMetadata) {
    Metadata.set(this.target, CONTROLLER_METADATA_KEY, meta);
  }

  get path(): string {
    return this.metadata.path;
  }

  get interceptors(): Class<any, Interceptable>[] {
    return this.metadata.interceptors;
  }

  get middlewares(): Class<any, Middleware>[] {
    return this.metadata.middlewares;
  }

  /**
   * Declare the class as controller with the given options and injects.
   *
   * @param options Options for the controller.
   */
  declare(
    options: Partial<ControllerMetadata>,
  ): void {
    // if the class is not declared yet, create the metadata with the default values and the given options
    if (!this.declared) {
      this.metadata = { ...defaultControllerMeta, ...options };
      return;
    }

    // merge the options with the existing metadata
    this.metadata = { ...this.metadata, ...options };
  }

  /**
   * Declare the injects of the controller.
   *
   * @param injects The injects of the controller.
   */
  declareInjects(injects: readonly Class[]): void {
    // delcare the controller as injectable with the given injects
    this.injectable.declare(injects);
  }

  getHandlers(externalInterceptors: Class<any[], Interceptable>[]): Handler[] {
    // resolve all methods of the controller and get the handlers
    const methodHandlers = Object.entries(
      Object.getOwnPropertyDescriptors(this.target.prototype),
    ).map<Handler[] | undefined>(([key, descriptor]) => {
      // skip constructor
      if (key === "constructor") return undefined;

      const method = new MethodManager(descriptor.value);

      // skip methods that are not declared as controller methods
      if (!method.declared) return undefined;

      return method.getHandlers(this.path, this.target, [
        ...externalInterceptors,
        ...this.interceptors,
      ]);
    }).flat().filter(Boolean) as Handler[];

    const middlewareHandlers = this.middlewares.map<MiddlewareHandler>((
      middleware,
    ) => ({
      type: "middleware",
      // create a wildcard path for the middleware (this adds a asterisk at the end of the path)
      path: createWildcardPath(this.path),
      // TODO make the priority configurable
      priority: 0,
      target: middleware,
    }));

    return [...middlewareHandlers, ...methodHandlers];
  }
}
