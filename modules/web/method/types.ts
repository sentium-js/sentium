import { ParamInjects } from "./param/types.ts";
import { Interceptable } from "./interceptor/types.ts";
import { Class } from "../../common/mod.ts";

export type MethodOptions = {
  method?: string;
  path?: string;
};

export type MethodMetadata = {
  method: string;
  path: string;

  params: ParamInjects;
  interceptors: Class<any, Interceptable>[];
};
