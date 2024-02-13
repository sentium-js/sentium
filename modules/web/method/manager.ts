import { Class, MaybePromise } from "../../common/mod.ts";
import { Method } from "../../common/mod.ts";
import { MethodHandler } from "../handler/types.ts";
import { ExecutionContext } from "../handler/context.ts";
import { MethodMetadata } from "./types.ts";
import { ParamInjects, ParamTypes } from "./param/types.ts";
import { resolve, resolveAsync } from "../../injectable/mod.ts";
import { Logger } from "../logger/logger.ts";
import { LogColor } from "../logger/colors.ts";
import { Interceptable } from "./interceptor/types.ts";
import { Metadata } from "../../metadata/mod.ts";

export const METHOD_METADATA_KEY = Symbol.for("sentium.method");

export const defaultMethodMeta: MethodMetadata = {
  method: "GET",
  path: "/",

  params: [],
  interceptors: [],
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

  get params() {
    return this.metadata.params;
  }

  get interceptors(): Class<any, Interceptable>[] {
    return this.metadata.interceptors;
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

  /**
   * Get the handler for the method which gets registered into the router adapter.
   *
   * @param controller The controller class which contains the method.
   * @param interceptors The intercepters coming from the controller and global intercepters from router.
   * @returns The handler for the method.
   */
  getHandler(
    controller: Class,
    interceptors: Class<any, Interceptable>[],
  ): MethodHandler {
    return async (ctx) => {
      const result = await this.callMethod(ctx, controller, [
        // merge global and class intercepters with method intercepters
        ...interceptors,
        ...this.interceptors,
      ]);
      this.handleResult(ctx, result);
    };
  }

  /**
   * Call the method of the controller with the resolved parameters and intercepters.
   *
   * @param ctx The execution context of the request.
   * @param controller The controller class which contains the method.
   * @returns The result of the method.
   */
  private async callMethod(
    ctx: ExecutionContext,
    controller: Class,
    interceptors: Class<any, Interceptable>[],
  ): Promise<unknown> {
    const logger = resolve(Logger, ctx.scope);

    // log the execution of the method
    logger.debug(
      `Controller/${controller.name}`,
      `Executing method ${
        LogColor.fg.cyan + this.target.name + LogColor.reset
      } at ${
        LogColor.fg.magenta + this.method + " " + this.path + LogColor.reset
      }`,
    );

    // the instance is resolved on demand which improves the startup time
    // optionally the instances can be preloaded on startup (instances are cached by the scope)
    const instance = await resolveAsync(controller, ctx.scope);

    // resolve the parameters of the method
    const params = await this.resolveParams(this.params, ctx);

    // resolve the intercepters of the method
    const resolvedInterceptors = await Promise.all(
      interceptors.map((interceptor) => resolveAsync(interceptor, ctx.scope)),
    );

    const result = await this.callInterceptors(
      ctx,
      resolvedInterceptors,
      () => this.target.call(instance, ...params),
    );

    return result;
  }

  /**
   * Call the provided method with the given intercepters.
   *
   * @param ctx The execution context of the request.
   * @param interceptors The intercepters to call before the method.
   * @param method The actual final method to call.
   * @returns The result of the method after the intercepters.
   */
  private callInterceptors(
    ctx: ExecutionContext,
    interceptors: Interceptable[],
    method: () => MaybePromise<unknown>,
  ): MaybePromise<unknown> {
    // if there are no interceptors left call the method
    if (interceptors.length === 0) {
      return method();
    } else {
      // shift the next interceptor from the array
      const next = interceptors.shift();
      if (!next) throw new Error("Interceptors array is empty");

      // call the next interceptor
      return next.intercept(
        ctx,
        // provide the next function which calls down the interceptor chain
        () => this.callInterceptors(ctx, interceptors, method),
      );
    }
  }

  /**
   * Transform the result of the method to the response body.
   *
   * @param ctx The execution context of the request.
   * @param result The result of the method.
   */
  private handleResult<T>(ctx: ExecutionContext, result: T): void {
    // TODO here should be the logic to determine the response type
    // TODO for now we always interpret the result as json
    ctx.res.json(result);
  }

  /**
   * Resolve the parameters of the method which are then injected into.
   *
   * @param params The list of parameters (param resolver) to resolve.
   * @param ctx The execution context of the request.
   * @returns The resolved parameters.
   */
  private resolveParams<Params extends ParamInjects>(
    params: Params,
    ctx: ExecutionContext,
  ): Promise<ParamTypes<Params>> {
    return Promise.all(
      params.map<MaybePromise<unknown>>((param) => param(ctx)),
    ) as Promise<ParamTypes<Params>>;
  }
}
