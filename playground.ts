import { controller, method, Router } from "./modules/web/mod.ts";
import { HonoAdapter } from "./modules/adapter-hono/mod.ts";
import { injectable } from "./modules/injectable/mod.ts";
import { param, params } from "./modules/web/mod.ts";

@injectable()
class Service {
  getInfo() {
    return "Hello World";
  }
}

@controller("/", [Service])
class MyController {
  constructor(private service: Service) {}

  @method({ path: "/info" })
  @params(param("user"))
  getInfo(user: string | null) {
    return this.service.getInfo();
  }
}

const router = new Router(new HonoAdapter(), [MyController]);

Deno.serve((req) => router.handle.fetch(req));
