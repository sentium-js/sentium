import {
  controller,
  get,
  header,
  inject,
  intercept,
  param,
  Router,
} from "./modules/web/mod.ts";
import { HonoAdapter } from "./modules/adapter-hono/mod.ts";
import { injectable } from "./modules/injectable/mod.ts";
import { createInterceptor } from "./modules/web/mod.ts";

const Inter1 = createInterceptor(async (_ctx, next) => {
  console.log("Before 1");
  const result = await next();
  console.log("After 1");

  return result;
});

const Inter2 = createInterceptor(async (_ctx, next) => {
  console.log("Before 2");
  const result = await next();
  console.log("After 2");

  return result;
});

@injectable()
class Service {
  constructor() {
    console.log("Service created");
  }

  getInfo(path: string | null) {
    return "Hello World - " + path;
  }
}

@controller("/", [Service])
@intercept(Inter1)
class MyController {
  constructor(private service: Service) {
    console.log("Controller created");
  }

  @get("/:path")
  @inject(param("path"))
  getInfo(path: string | null) {
    return this.service.getInfo(path);
  }

  @get()
  @inject(header("User-Agent"))
  @intercept(Inter2)
  index(header: string | null) {
    console.log("method");
    return "You are at the index page. Your user agent is: " + header;
  }
}

const router = new Router({
  adapter: new HonoAdapter(),
  controllers: [MyController],
  interceptors: [Inter2],
});

Deno.serve((req) => router.handle.fetch(req));
