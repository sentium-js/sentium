import { Class } from "../../common/mod.ts";
import { Interceptable } from "../method/interceptor/types.ts";
import { Middleware } from "../middleware/types.ts";

export type ControllerOptions = {
  path: string;
};

export type ControllerMetadata = {
  path: string;
  interceptors: Class<any, Interceptable>[];
  middlewares: Class<any, Middleware>[];
};
