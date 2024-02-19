import { Context } from "../execution/types.ts";

export interface Middleware {
  handle(
    ctx: Context,
    next: () => Promise<void>,
  ): Promise<void>;
}
