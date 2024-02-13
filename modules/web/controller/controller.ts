import { Class, InstanceTypes } from "../../common/mod.ts";
import { ControllerOptions } from "./types.ts";
import { ControllerManager } from "./manager.ts";

export const controller = <
  Target extends Class<InstanceTypes<Injects>>,
  const Injects extends readonly Class[] = readonly [],
>(
  options: ControllerOptions | string,
  injects: Injects = [] as unknown as Injects,
) =>
(target: Target, _context: ClassDecoratorContext<Target>) => {
  // if options is a string, interpret it as the path
  if (typeof options === "string") {
    options = { path: options };
  }

  // declare the class as a controller
  new ControllerManager(target).declare(options, injects);
};
