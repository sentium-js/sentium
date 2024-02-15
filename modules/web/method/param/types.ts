import { MaybePromise } from "../../../common/mod.ts";
import { Context } from "../../execution/types.ts";

export type ParamResolver<T = unknown> = (
  ctx: Context,
) => MaybePromise<T>;

export type ParamInjects = readonly ParamResolver[];

export type ParamType<Param extends ParamResolver> = Param extends
  ParamResolver<infer T> ? T : never;

export type ParamTypes<Params extends ParamInjects> = {
  readonly [Key in keyof Params]: ParamType<Params[Key]>;
};
