import { MaybePromise } from "../../common/mod.ts";
import { ExecutionRequest } from "./context.ts";

export type AdapterMethodHandler<Req extends Request> = (
  req: ExecutionRequest<Req>,
  env: unknown,
) => MaybePromise<Response>;

export type AdapterMiddlewareHandler<Req extends Request> = (
  req: ExecutionRequest<Req>,
  env: unknown,
  next: () => MaybePromise<void>,
) => MaybePromise<void>;

export type MethodRegistration<Req extends Request> = {
  method: string;
  path: string;

  handler: AdapterMethodHandler<Req>;
};

export type MiddlewareRegistration<Req extends Request> = {
  path: string;

  handler: AdapterMiddlewareHandler<Req>;
};

export interface Adapter<Req extends Request = Request, Handle = unknown> {
  registerMiddleware(registration: MiddlewareRegistration<Req>): void;
  registerMethod(registration: MethodRegistration<Req>): void;

  handle: Handle;
}
