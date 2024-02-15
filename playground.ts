import { injectable } from "./modules/injectable/mod.ts";
import {} from "./modules/web/mod.ts";
import {
  Application,
  Context,
  controller,
  ctx,
  get,
  inject,
  Middleware,
  param,
} from "./modules/web/mod.ts";

@injectable([], async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return new AsyncDependency(Date.now());
})
class AsyncDependency {
  constructor(private readonly now: number) {}

  getInitializedNow() {
    return this.now;
  }
}

@controller({ path: "/users" }, [AsyncDependency])
class UserController {
  constructor(private readonly dep: AsyncDependency) {}

  @get("/")
  getAll() {
    return "All users with initialized now: " + this.dep.getInitializedNow();
  }

  @get("/:id")
  @inject(param<string>("id"), ctx)
  getById(id: string, ctx: Context) {
    // throw new Error("My Error");
    return `User with id: ${id}`;
  }
}

@injectable()
class Middle implements Middleware {
  async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
    await next();
  }
}

const app = new Application();

app.registerController(UserController);
app.registerMiddleware(Middle);

Deno.serve((req) => app.fetch(req));
