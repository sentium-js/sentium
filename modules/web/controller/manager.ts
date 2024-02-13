import { Class } from "../../common/mod.ts";
import { InjectableManager } from "../../injectable/mod.ts";
import { Metadata } from "../../metadata/mod.ts";
import { ControllerMetadata } from "./types.ts";
import { HandlerInfo } from "../handler/types.ts";
import { MethodManager } from "../method/manager.ts";
import { MethodHandlerInfo, MiddlewareHandlerInfo } from "../handler/types.ts";
import { Interceptable } from "../method/interceptor/types.ts";

export const CONTROLLER_METADATA_KEY = Symbol.for("sentium.controller");

export const defaultControllerMeta: ControllerMetadata = {
  path: "/",
  interceptors: [],
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

  get interceptors(): Class<any, Interceptable>[] {
    return this.metadata.interceptors;
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

  /**
   * Get all handler (methods with interceptors and middlewares) information of the controller.
   *
   * @param interceptors The global interceptors of the router.
   * @returns
   */
  getHandlerInfo(interceptors: Class<any, Interceptable>[]): HandlerInfo[] {
    const methods = Object.entries(
      Object.getOwnPropertyDescriptors(this.target.prototype),
    ).map<MethodHandlerInfo | undefined>(([key, descriptor]) => {
      // skip constructor
      if (key === "constructor") return undefined;

      const method = new MethodManager(descriptor.value);

      // skip methods that are not declared as controller methods
      if (!method.declared) return undefined;

      return {
        type: "method",
        method: method.method,
        path: method.path,
        handler: method.getHandler(this.target, [
          ...interceptors,
          ...this.interceptors,
        ]),
      };
    }).filter(Boolean) as MethodHandlerInfo[];

    // TODO get middleware handlers
    const middlewares: MiddlewareHandlerInfo[] = [];

    return [...middlewares, ...methods];
  }
}
