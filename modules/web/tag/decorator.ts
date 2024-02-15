import { Class, Method } from "../../common/mod.ts";
import { TagManager } from "./tag.ts";

/**
 * A decorator to set a tag with a given value.
 *
 * Useful for adding metadata to classes and methods
 * and use it in an auth middleware, for example.
 *
 * @param tag The tag key.
 * @param value The tag value.
 */
export const tag =
  <Target extends Class | Method>(tag: PropertyKey, value: unknown) =>
  (
    target: Target,
    _context: ClassDecoratorContext | ClassMethodDecoratorContext,
  ) => {
    TagManager.of(target).set(tag, value);
  };
