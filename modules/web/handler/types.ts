import { MaybePromise } from "../../common/mod.ts";
import { Context } from "./context.ts";

export type Body = BodyInit | null | undefined;

export type Handler = MethodHandler | MiddlewareHandler;

export type MethodHandler<Req extends Request = Request> = (
  ctx: Context<Req>,
) => Promise<void>;

export type MiddlewareHandler<Req extends Request = Request> = (
  ctx: Context<Req>,
  next: () => Promise<void>,
) => Promise<void>;

export type HandlerInfo = MethodHandlerInfo | MiddlewareHandlerInfo;

export type MethodHandlerInfo = {
  type: "method";
  method: string;
  path: string;
  handler: MethodHandler;
};

export type MiddlewareHandlerInfo = {
  type: "middleware";
  path: string;
  handler: MiddlewareHandler;
};

/**
 * A function that can transform handler info.
 *
 * For example, for a plugin which adds a version prefix to all routes.
 */
export type TransformHandlerInfo = (
  handlerInfo: HandlerInfo,
) => MaybePromise<HandlerInfo | null>;

export type HandlerContextGetter<Env = unknown> = (
  current: ExecutionContext | undefined,
  request: Request,
  params: Record<string, string>,
  env: Env,
) => ExecutionContext;
