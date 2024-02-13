import { Method } from "../../common/mod.ts";
import { Meta } from "../meta/meta.ts";
import { MethodMetaMap } from "./types.ts";
import { defaultMethodMeta, METHOD_META_KEY } from "./manager.ts";

export const createMethodShortcut =
  (method: string) =>
  (path = "/") =>
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
      method,
      path,
    });
  };
