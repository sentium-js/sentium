import { Class, Method } from "../../common/mod.ts";
import { Meta } from "./meta.ts";
import { MetaMap, MetaValue } from "./types.ts";

export const setMeta = <
  M extends MetaMap,
  Key extends keyof M,
>(
  key: Key,
  value: MetaValue<M, Key>,
) =>
<Target extends Class | Method>(
  target: Target,
  _context: ClassDecoratorContext | ClassMethodDecoratorContext,
) => Meta.set(target, key, value);
