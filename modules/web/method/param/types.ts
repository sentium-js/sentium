import { MaybePromise } from "../../../common/mod.ts";
import { ExecutionContext } from "../../handler/context.ts";

export type ParamResolver<T = unknown> = (
  ctx: ExecutionContext,
) => MaybePromise<T>;

export type ParamInjects = readonly ParamResolver[];

export type ParamType<Param extends ParamResolver> = Param extends
  ParamResolver<infer T> ? T : never;

export type ParamTypes<Params extends ParamInjects> = {
  readonly [Key in keyof Params]: ParamType<Params[Key]>;
};
