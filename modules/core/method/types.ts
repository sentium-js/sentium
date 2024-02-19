import { ParamInjects } from "./param/types.ts";
import { Interceptable } from "./interceptor/types.ts";
import { Middleware } from "../middleware/types.ts";
import { Class } from "../utils/types.ts";

export type MethodOptions = {
  method?: string;
  path?: string;
  priority?: number;
};

export type MethodMetadata = {
  method: string;
  path: string;
  priority: number;

  params: ParamInjects;
  interceptors: Class<any, Interceptable>[];
  middlewares: Class<any, Middleware>[];
};
