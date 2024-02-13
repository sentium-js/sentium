import { Class, MaybePromise } from "../../common/mod.ts";
import { Method } from "../../common/mod.ts";
import { MethodHandler } from "../handler/types.ts";
import { ExecutionContext } from "../handler/context.ts";
import { Meta } from "../meta/meta.ts";
import { MethodMeta, MethodMetaMap } from "./types.ts";
import { ParamInjects, ParamTypes } from "./param/types.ts";

export const METHOD_META_KEY = Symbol.for("sentium.method.meta");

export const defaultMethodMeta: MethodMeta = {
  method: "GET",
  path: "/",

  params: [],
};

export class MethodManager<Target extends Method> {
  private readonly meta: Meta<Target, MethodMetaMap>;

  constructor(private readonly target: Target) {
    this.meta = Meta.of(target);
  }

  get declared(): boolean {
    return this.meta.has(METHOD_META_KEY);
  }

  get method(): string {
    return this.meta.get(METHOD_META_KEY).method;
  }

  get path(): string {
    return this.meta.get(METHOD_META_KEY).path;
  }

  get params() {
    return this.meta.get(METHOD_META_KEY).params;
  }

  getHandler(instance: InstanceType<Class>): MethodHandler {
    return async (ctx) => {
      // TODO interceptors
      const params = await this.resolveParams(this.params, ctx);
      const _result = await this.target.call(instance, ...params);
      // TODO handle result -> for now just interpret as json
      ctx.res.json(_result);
    };
  }

  private resolveParams<Params extends ParamInjects>(
    params: Params,
    ctx: ExecutionContext,
  ): Promise<ParamTypes<Params>> {
    return Promise.all(
      params.map<MaybePromise<unknown>>((param) => param(ctx)),
    ) as Promise<ParamTypes<Params>>;
  }
}
