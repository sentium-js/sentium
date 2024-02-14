import { ExecutionContext } from "../handler/context.ts";

export type MiddlewareFunction = (
  ctx: ExecutionContext,
  next: () => Promise<void>,
) => Promise<void>;

export interface Middleware {
  handle: MiddlewareFunction;
}

// TODO discuss how to use middlewares
