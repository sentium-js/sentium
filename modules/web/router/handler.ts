import { MaybePromise } from "../../common/mod.ts";
import { Handler as HonoHandler } from "../../dep/hono.ts";

export type Handler = MethodHandler | MiddlewareHandler;

export type MethodHandler = {
  type: "method";
  method: string;
  path: string;
  handler: HonoHandler;
};

export type MiddlewareHandler = {
  type: "middleware";
  path: string;
  handler: HonoHandler;
};

/**
 * A function that can transform handlers.
 *
 * For example, for a plugin which adds a version prefix to all routes.
 */
export type TransformHandler = (
  handler: Handler,
) => MaybePromise<Handler | null>;
