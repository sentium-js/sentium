import { Method } from "../../common/mod.ts";
import { Meta } from "../meta/meta.ts";
import { defaultMethodMeta, METHOD_META_KEY } from "./manager.ts";
import { ParamInjects, ParamTypes } from "./param/types.ts";
import { MethodMetaMap, MethodOptions } from "./types.ts";
import { createMethodShortcut } from "./utils.ts";

export const method =
  (options: MethodOptions = {}) =>
  <This, Target extends Method>(
    target: Target,
    context: ClassMethodDecoratorContext<This, Target>,
  ) => {
    if (context.static) {
      throw new Error("Method decorators can't be used on static methods");
    }

    const meta = Meta.of<Target, MethodMetaMap>(target);

    // set default method meta
    meta.default(METHOD_META_KEY, defaultMethodMeta);

    // merge with options
    meta.set(METHOD_META_KEY, {
      ...meta.get(METHOD_META_KEY),
      ...options,
    });
  };

export const inject =
  <const Params extends ParamInjects>(...params: Params) =>
  <This, Target extends Method<This, ParamTypes<Params>>>(
    target: Target,
    context: ClassMethodDecoratorContext<This, Target>,
  ) => {
    if (context.static) {
      throw new Error("Method decorators can't be used on static methods");
    }

    const meta = Meta.of<Target, MethodMetaMap>(target);

    // set default method meta
    meta.default(METHOD_META_KEY, defaultMethodMeta);

    // merge with options
    meta.set(METHOD_META_KEY, {
      ...meta.get(METHOD_META_KEY),
      params,
    });
  };

// -- method shortcuts --

export const get = createMethodShortcut("GET");

export const post = createMethodShortcut("POST");

export const put = createMethodShortcut("PUT");

export const patch = createMethodShortcut("PATCH");

export const del = createMethodShortcut("DELETE");
