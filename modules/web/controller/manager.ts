import { Class } from "../../common/mod.ts";
import { InjectableManager } from "../../injectable/mod.ts";
import { Metadata } from "../../metadata/mod.ts";
import { ControllerMetadata, ControllerOptions } from "./types.ts";
import { Adapter } from "../handler/adapter.ts";

export const CONTROLLER_METADATA_KEY = Symbol.for("sentium.controller");

export class ControllerManager<Target extends Class> {
  private readonly injectable: InjectableManager<Target>;

  constructor(private readonly target: Target) {
    this.injectable = new InjectableManager(target);
  }

  /**
   * Returns `true` if the class is declared as controller. Otherwise `false`.
   */
  get declared(): boolean {
    return Metadata.get(this.target, CONTROLLER_METADATA_KEY) !== undefined;
  }

  /**
   * Returns the metadata of the controller class or throws an error if the class is not declared as controller.
   */
  private get metadata(): ControllerMetadata {
    const meta = Metadata.get<ControllerMetadata>(
      this.target,
      CONTROLLER_METADATA_KEY,
    );

    if (!meta) {
      throw new Error(
        `Failed to access metadata of a non-controller class: ${this.target.name}`,
      );
    }

    return meta;
  }

  /**
   * Declare the class as controller with the given options and injects.
   *
   * @param options Options for the controller.
   * @param injects List of classes to inject into the class.
   */
  declare<Injects extends readonly Class[]>(
    options: ControllerOptions,
    injects: Injects,
  ): void {
    // Check if the class is already declared as controller and throw an error if so
    if (this.declared) {
      throw new Error(
        `Failed to declare '${this.target.name}' as controller: Already an injectable.`,
      );
    }

    // delcare the controller as injectable
    this.injectable.declare(injects);

    // Create the metadata of the controller class
    const meta: ControllerMetadata = {
      options,
    };

    // Declare the class as controller by setting the metadata
    Metadata.set(this.target, CONTROLLER_METADATA_KEY, meta);
  }

  registerHandlers(adapter: Adapter) {
    // TODO register the handlers

    adapter.registerMethod({
      method: "GET",
      path: "/",
      handler: () => new Response("Hello World"),
    });
  }
}
