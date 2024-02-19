import { Metadata } from "../metadata/metadata.ts";
import { Class, InstanceTypes } from "../utils/types.ts";
import { InjectableInitializer } from "./types.ts";
import { InjectableMetadata } from "./types.ts";
import { InjectableScope } from "./types.ts";

export const INJECTABLE_METADATA_KEY = Symbol.for("sentium.injectable");
export const defaultInjectableScope: InjectableScope = Symbol.for(
  "sentium.injectable.defaultScope",
);

/**
 * Manager for the injectable class. Provides methods for declaring and resolving the injectable class.
 */
export class InjectableManager<Target extends Class> {
  constructor(private readonly target: Target) {}

  /**
   * Returns `true` if the class is declared as injectable. Otherwise `false`.
   */
  get declared(): boolean {
    return Metadata.get(this.target, INJECTABLE_METADATA_KEY) !== undefined;
  }

  /**
   * Returns the metadata of the injectable class or throws an error if the class is not declared as injectable.
   */
  private get metadata(): InjectableMetadata<Target, readonly Class[]> {
    const meta = Metadata.get<InjectableMetadata<Target, readonly Class[]>>(
      this.target,
      INJECTABLE_METADATA_KEY,
    );

    if (!meta) {
      throw new Error(
        `Failed to access metadata of a non-injectable class: ${this.target.name}`,
      );
    }

    return meta;
  }

  /**
   * Declare the class as injectable with the given injects and initializer.
   *
   * @param injects List of classes to inject into the class.
   * @param initializer Optional initializer for the class.
   */
  declare<Injects extends readonly Class[]>(
    injects: Injects,
    initializer?: InjectableInitializer<
      InstanceTypes<Injects>,
      InstanceType<Target>
    >,
  ): void {
    // Check if the class is already declared as injectable and throw an error if so
    if (this.declared) {
      throw new Error(
        `Failed to declare '${this.target.name}' as injectable: Already an injectable.`,
      );
    }

    // Create the metadata of the injectable class
    const meta: InjectableMetadata<Target, Injects> = {
      instances: new Map(),
      asyncResolves: new Map(),
      injects,
      initializer,
    };

    // Declare the class as injectable by setting the metadata
    Metadata.set(this.target, INJECTABLE_METADATA_KEY, meta);
  }

  /**
   * Syncronously resolve the injectable class for the given scope.
   *
   * If the class is not declared as injectable, an error is thrown.
   *
   * Injectables with an async initializer can only be resolved syncronously if the instance already exists.
   *
   * @param scope Scope of the instance.
   * @returns Instance of the class.
   */
  resolve(
    scope: InjectableScope = defaultInjectableScope,
  ): InstanceType<Target> {
    // try get an existing instance for the given scope
    let instance = this.metadata.instances.get(scope);

    // return the instance if it exists
    if (instance) return instance;

    // resolve the arguments
    const args = this.resolveArgs(scope);

    // if an initializer is provided
    if (this.metadata.initializer) {
      // if an async initialization is already in progress, throw an error to prevent multiple async initializations
      if (this.metadata.asyncResolves.get(scope)) {
        throw new Error(
          `Failed to resolve async injectable '${this.target.name}' with an sync resolver. Use 'resolveAsync' instead.`,
        );
      }

      // initialize the class
      const initializedClass = this.metadata.initializer(...args);

      // if the initializer returns a promise throw an error because the sync resolver can't handle async initializations
      // also add the promise to the asyncResolves to prevent multiple async initializations
      if (initializedClass instanceof Promise) {
        // handle the promise -> add the instance to the instances on resolve and finally remove the promise from the asyncResolves
        const resolvePromise = initializedClass
          .then((instance) => {
            // on promise resolve add the instance to the instances
            this.metadata.instances.set(scope, instance);
            return instance;
          })
          .finally(() => {
            // finally remove the promise from the asyncResolves
            this.metadata.asyncResolves.delete(scope);
          });

        // add the promise to the asyncResolves to prevent multiple async initializations
        this.metadata.asyncResolves.set(scope, resolvePromise);

        // throw an error for the sync resolver
        throw new Error(
          `Failed to resolve async injectable '${this.target.name}' with an sync resolver. Use 'resolveAsync' instead.`,
        );
      }

      // set the instance to the newly initialized class
      instance = initializedClass as InstanceType<Target>;
    } else {
      // if no initializer is provided, create a new instance of the class
      instance = new this.target(...args) as InstanceType<Target>;
    }

    // cast the instance to a non-undefined type because at this point the instance is guaranteed to be defined
    // (why typescipt can't figure this out?)
    const finalInstance = instance as InstanceType<Target>;

    // finally add the instance to the instances
    this.metadata.instances.set(scope, finalInstance);

    // return the instance
    return finalInstance;
  }

  /**
   * Asynchronously resolve the injectable class for the given scope.
   *
   * If the class is not declared as injectable, an error is thrown.
   *
   * @param scope Scope of the instance.
   * @returns Promise of the instance of the class.
   */
  async resolveAsync(
    scope: InjectableScope = defaultInjectableScope,
  ): Promise<InstanceType<Target>> {
    // try get an existing instance for the given scope
    let instance = this.metadata.instances.get(scope);

    // return the instance if it exists
    if (instance) return instance;

    // resolve the arguments
    const args = await this.resolveArgsAsync(scope);

    // if an initializer is provided
    if (this.metadata.initializer) {
      // if an async initialization is already in progress, return the promise to prevent multiple async initializations
      if (this.metadata.asyncResolves.get(scope)) {
        return this.metadata.asyncResolves.get(scope) as Promise<
          InstanceType<Target>
        >;
      }

      // set the instance to the newly initialized class
      const initializedClass = this.metadata.initializer(...args);

      // if the initializer returns a promise add the promise to the asyncResolves to prevent multiple async initializations
      if (initializedClass instanceof Promise) {
        const instancePromise = initializedClass.finally(() => {
          this.metadata.asyncResolves.delete(scope);
        });

        // add the promise to the asyncResolves to prevent multiple async initializations
        this.metadata.asyncResolves.set(scope, instancePromise);

        // await the promise and set the instance
        instance = await instancePromise;
      } else {
        // in case the initializer returns a non-promise value
        // set the instance to the newly initialized class
        instance = initializedClass as InstanceType<Target>;
      }
    } else {
      // if no initializer is provided, create a new instance of the class
      instance = new this.target(...args) as InstanceType<Target>;
    }

    // cast the instance to a non-undefined type because at this point the instance is guaranteed to be defined
    // (why typescipt can't figure this out?)
    const finalInstance = instance as InstanceType<Target>;

    // finally add the instance to the instances
    this.metadata.instances.set(scope, finalInstance);

    // return the instance
    return finalInstance;
  }

  /**
   * Syncronously resolve the injects for the current target and scope.
   *
   * @param scope Scope of the instance.
   * @returns Array of the resolved injects.
   */
  private resolveArgs(scope: InjectableScope): unknown[] {
    return this.metadata.injects
      .map((inject) => new InjectableManager(inject))
      .map((manager) => manager.resolve(scope));
  }

  /**
   * Asyncronously resolve the injects for the current target and scope.
   *
   * @param scope Scope of the instance.
   * @returns Promise of the array of the resolved injects.
   */
  private resolveArgsAsync(scope: InjectableScope): Promise<unknown[]> {
    return Promise.all(
      this.metadata.injects
        .map((inject) => new InjectableManager(inject))
        .map((manager) => manager.resolveAsync(scope)),
    );
  }
}
