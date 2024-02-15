import { Method } from "../../common/mod.ts";
import { MethodManager } from "./manager.ts";

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

    new MethodManager(target).declare({ method, path });
  };
