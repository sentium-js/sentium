import { Interceptable } from "../method/interceptor/types.ts";
import { Middleware } from "../middleware/types.ts";
import { Class } from "../utils/types.ts";

export type ControllerOptions = {
  path: string;
};

export type ControllerMetadata = {
  path: string;
  interceptors: Class<any, Interceptable>[];
  middlewares: Class<any, Middleware>[];
};
