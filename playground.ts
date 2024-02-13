import {
  controller,
  get,
  header,
  inject,
  param,
  Router,
} from "./modules/web/mod.ts";
import { HonoAdapter } from "./modules/adapter-hono/mod.ts";
import { injectable } from "./modules/injectable/mod.ts";

@injectable()
class Service {
  getInfo(path: string | null) {
    return "Hello World - " + path;
  }
}

@controller("/", [Service])
class MyController {
  constructor(private service: Service) {}

  @get("/:path")
  @inject(param("path"))
  getInfo(path: string | null) {
    return this.service.getInfo(path);
  }

  @get()
  @inject(header("User-Agent"))
  index(header: string | null) {
    return "You are at the index page. Your user agent is: " + header;
  }
}

const router = new Router(new HonoAdapter(), [MyController]);

Deno.serve((req) => router.handle.fetch(req));
