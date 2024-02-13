import { Class } from "../../common/mod.ts";
import { Hono } from "../../dep/hono.ts";
import { ControllerManager } from "../controller/manager.ts";

export class Router {
  readonly handle: Hono;

  constructor(controllers: Class[] = []) {
    this.handle = new Hono();

    // register all controllers
    controllers.forEach((controller) => this.registerController(controller));
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
    manager.registerHandlers(this);
  }
}
