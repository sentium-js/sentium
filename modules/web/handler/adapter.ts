import { ExecutionContext } from "./context.ts";

export type AdapterContextGetter<Req extends Request, Env = unknown> = (
  current: ExecutionContext | undefined,
  request: Req,
  params: Record<string, string>,
  env: Env,
) => ExecutionContext;

export interface Adapter<Req extends Request = Request, Handle = unknown> {
  readonly handle: Handle;

  registerMethod(
    method: string,
    path: string,
    handler: (ctx: ExecutionContext<Req>) => Promise<void>,
    getContext: AdapterContextGetter<Req>,
  ): void;

  registerMiddleware(
    path: string,
    handler: (
      ctx: ExecutionContext<Req>,
      next: () => Promise<void>,
    ) => Promise<void>,
    getContext: AdapterContextGetter<Req>,
  ): void;
}
