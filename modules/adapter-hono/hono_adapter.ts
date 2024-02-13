import {
  Adapter,
  AdapterMethodHandler,
  AdapterMiddlewareHandler,
  ExecutionRequest,
  MethodRegistration,
  MiddlewareRegistration,
} from "../web/mod.ts";
import { Handler, Hono, MiddlewareHandler } from "./dep.ts";

export class HonoAdapter implements Adapter<Request, Hono> {
  constructor(private hono: Hono = new Hono()) {}

  get handle(): Hono {
    return this.hono;
  }

  registerMethod({ method, path, handler }: MethodRegistration<Request>): void {
    this.hono.on(method, path, this.createMethodHandler(handler));
  }

  registerMiddleware({ path, handler }: MiddlewareRegistration<Request>): void {
    this.hono.use(path, this.createMiddlewareHandler(handler));
  }

  private createMethodHandler(handler: AdapterMethodHandler<Request>): Handler {
    return async (ctx) => {
      const req = new ExecutionRequest(ctx.req.raw, ctx.req.param());
      return await handler(req, ctx.env);
    };
  }

  private createMiddlewareHandler(
    handler: AdapterMiddlewareHandler<Request>,
  ): MiddlewareHandler {
    return async (ctx, next) => {
      const req = new ExecutionRequest(ctx.req.raw, ctx.req.param() as any);
      await handler(req, ctx.env, () => next());
    };
  }
}
