export { controller } from "./controller/controller.ts";

export { type Adapter, type AdapterContextGetter } from "./handler/adapter.ts";
export {
  type ExecutionContext,
  HttpRequest,
  HttpResponse,
} from "./handler/context.ts";
export { type Body } from "./handler/types.ts";

// TODO rethink metadata and decorators
// export { meta } from "./meta/decorator.ts";
// export { Meta } from "./meta/meta.ts";

export * from "./method/decorator.ts";
export { type MethodOptions } from "./method/types.ts";

export { intercept } from "./method/interceptor/decorator.ts";
export { createInterceptor } from "./method/interceptor/interceptor.ts";
export { type Interceptable } from "./method/interceptor/types.ts";

export * from "./method/param/common.ts";
export { type ParamResolver, type ParamType } from "./method/param/types.ts";

export { Router } from "./app/app.ts";
