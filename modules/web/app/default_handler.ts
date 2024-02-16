import { InjectableManager } from "../../injectable/mod.ts";
import { Context, ErrorHandler, NotFoundHandler } from "../execution/types.ts";

export class DefaultHandler implements NotFoundHandler, ErrorHandler {
  onNotFound(ctx: Context) {
    ctx.res.status = 404;
    ctx.res.json({ error: "Not Found" });
  }

  onError(ctx: Context) {
    ctx.res.status = 500;
    ctx.res.json({ error: "Internal Server Error" });
  }
}

// declare the default handler as injectable
new InjectableManager(DefaultHandler).declare([]);
