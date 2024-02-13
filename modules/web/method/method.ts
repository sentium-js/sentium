import { MethodMeta } from "./types.ts";

export const METHOD_META_KEY = Symbol.for("sentium.method.meta");

export const defaultMethodMeta: MethodMeta = {
  method: "GET",
  path: "/",

  params: [],
};
