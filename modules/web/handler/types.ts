import { MaybePromise } from "../../common/mod.ts";
import { ExecutionContext } from "./context.ts";

export type Body = BodyInit | null | undefined;

export type Handler = MethodHandler | MiddlewareHandler;

export type MethodHandler<Req extends Request = Request> = (
  ctx: ExecutionContext<Req>,
) => Promise<void>;

export type MiddlewareHandler<Req extends Request = Request> = (
  ctx: ExecutionContext<Req>,
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
