import { METHOD_META_KEY } from "./method.ts";
import { ParamInjects } from "./param/types.ts";

export type MethodOptions = {
  method?: string;
  path?: string;
};

export type MethodMeta = {
  method: string;
  path: string;

  params: ParamInjects;
  // todo interceptors
};

export type MethodMetaMap = {
  [METHOD_META_KEY]: MethodMeta;
};
