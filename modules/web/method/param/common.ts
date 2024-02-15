import { Context } from "../../execution/types.ts";
import { ParamResolver } from "./types.ts";

export const ctx: ParamResolver<Context> = (ctx: Context) => ctx;

export const param = <T extends string | null = string | null>(
  param: string,
): ParamResolver<T> =>
(ctx: Context) => ctx.req.param(param) as T;

export const query = <T extends string | null = string | null>(
  query: string,
): ParamResolver<T> =>
(ctx: Context) => ctx.req.query(query) as T;

export const header = <T extends string | null = string | null>(
  header: string,
): ParamResolver<T> =>
(ctx: Context) => ctx.req.header(header) as T;
