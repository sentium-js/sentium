import { Adapter, AdapterContextGetter, ExecutionContext } from "../web/mod.ts";
import { Context, Hono } from "./dep.ts";

const HONO_CONTEXT_KEY = Symbol();

type HonoEnv = {
  Variables: { [HONO_CONTEXT_KEY]: ExecutionContext<Request> | undefined };
};

/**
 * An adapter for the Hono framework.
 */
export class HonoAdapter<T extends Hono> implements Adapter<Request, Hono> {
  private readonly hono: Hono<T>;

  /**
   * Initializes the adapter with the given hono instance.
   *
   * @param hono The hono instance to use (optional). If not provided, a new instance will be created.
   */
  constructor(hono?: T) {
    this.hono = hono ?? new Hono();
  }

  /**
   * The hono instance used by this adapter.
   *
   * Used this to start listening for incoming requests.
   */
  get handle(): T {
    return this.hono as T;
  }

  registerMethod(
    method: string,
    path: string,
    handler: (ctx: ExecutionContext) => Promise<void>,
    getContext: AdapterContextGetter<Request>,
  ): void {
    this.hono.on(method, path, async ({ get, req, env }: Context<HonoEnv>) => {
      // resolve the current execution context
      const ctx = getContext(
        // the current execution context from hono if present (otherwise it will created automatically)
        get(HONO_CONTEXT_KEY),
        // the raw request from hono
        req.raw,
        // the url params from hono
        req.param(),
        // the environment variables from hono
        env,
      );

      // execute the handler
      await handler(ctx);

      // return the response from the execution context
      return ctx.res.toResponse();
    });
  }

  registerMiddleware(
    path: string,
    handler: (
      ctx: ExecutionContext,
      next: () => Promise<void>,
    ) => Promise<void>,
    getContext: AdapterContextGetter<Request>,
  ): void {
    this.hono.use(
      path,
      async (
        { get, req, env }: Context<HonoEnv>,
        next: () => Promise<void>,
      ) => {
        // resolve the current execution context
        const ctx = getContext(
          // the current execution context from hono if present (otherwise it will created automatically)
          get(HONO_CONTEXT_KEY),
          // the raw request from hono
          req.raw,
          // the url params from hono
          req.param(),
          // the environment variables from hono
          env,
        );

        // execute the handler and forward the next function
        await handler(ctx, () => next());
      },
    );
  }
}
