import { ControllerOptions } from "./types.ts";
import { ControllerManager } from "./manager.ts";
import { Class, InstanceTypes } from "../utils/types.ts";

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

  const controller = new ControllerManager(target);

  // declare the controller with the options
  controller.declare(options);

  // declare the controller as injectable
  controller.declareInjects(injects);
};
