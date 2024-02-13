import { ParamResolver } from "./types.ts";
import { ExecutionContext } from "../../handler/context.ts";

export const param =
  (param: string): ParamResolver<string | null> => (ctx: ExecutionContext) =>
    ctx.req.param(param);

export const query =
  (query: string): ParamResolver<string | null> => (ctx: ExecutionContext) =>
    ctx.req.query(query);

export const header = (header: string): ParamResolver<string | null> =>
(
  ctx: ExecutionContext,
) => ctx.req.header(header);
