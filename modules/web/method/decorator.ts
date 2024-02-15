import { Method } from "../../common/mod.ts";
import { MethodManager } from "./manager.ts";
import { ParamInjects, ParamTypes } from "./param/types.ts";
import { MethodOptions } from "./types.ts";
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

    const method = new MethodManager(target);
    method.declare(options);
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

    const method = new MethodManager(target);
    method.declare({ params });
  };

// -- method shortcuts --

export const get = createMethodShortcut("GET");

export const post = createMethodShortcut("POST");

export const put = createMethodShortcut("PUT");

export const patch = createMethodShortcut("PATCH");

export const del = createMethodShortcut("DELETE");
