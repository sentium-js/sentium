import { Class } from "../../common/mod.ts";
import { ControllerManager } from "../controller/manager.ts";
import { Adapter } from "../handler/adapter.ts";

export class Router<A extends Adapter> {
  constructor(public readonly adapter: A, controllers: Class[] = []) {
    // register all controllers
    controllers.forEach((controller) => this.registerController(controller));
  }

  get handle(): A["handle"] {
    return this.adapter.handle;
  }

  private registerController(controller: Class) {
    const manager = new ControllerManager(controller);

    // check if the class is declared as controller
    if (!manager.declared) {
      throw new Error(
        `Failed to register controller: ${controller.name} is not declared as controller`,
      );
    }

    // let the controller register its handlers
    manager.registerHandlers(this.adapter);
  }
}
