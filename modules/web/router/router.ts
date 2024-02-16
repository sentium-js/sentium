import { Result } from "./hono/router.ts";
import { SmartRouter } from "./hono/smart-router.ts";
import { RegExpRouter } from "./hono/reg-exp-router.ts";
import { TrieRouter } from "./hono/trie-router.ts";

import { InjectableScope, resolve } from "../../injectable/mod.ts";
import { LogColor } from "../logger/colors.ts";
import { Logger } from "../logger/logger.ts";
import {
  Handler,
  HandlerMatch,
  MatchParams,
  MatchResult,
  MethodHandler,
  MiddlewareHandler,
} from "./types.ts";

/**
 * A fast url router which supports trie and regex (a superset of the hono router).
 */
export class Router {
  private readonly router: SmartRouter<Handler>;
  private readonly logger: Logger;

  constructor(scope: InjectableScope) {
    this.logger = resolve(Logger, scope);
    this.logger.debug("Router", "Creating router...");

    this.router = new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()],
    });
  }

  get strategy(): "RegExpRouter" | "TrieRouter" | undefined {
    try {
      return this.router.activeRouter.name as
        | "RegExpRouter"
        | "TrieRouter"
        | undefined;
    } catch {
      return undefined;
    }
  }

  get name(): string {
    return this.router.name;
  }

  add(handler: Handler) {
    // TODO router hook to manipulate the handler before adding it (versioning prefix etc.)
    switch (handler.type) {
      case "method":
        this.router.add(handler.method, handler.path, handler);

        this.logger.info(
          "Router",
          `Mapped ${
            LogColor.fg.magenta + handler.method +
            " " + handler.path + LogColor.reset
          } ${
            handler.priority !== 0
              ? `<${LogColor.fg.red + handler.priority + LogColor.reset}> `
              : ""
          }to ${
            LogColor.fg.black + handler.controller.name + "." +
            handler.target.name + LogColor.reset
          }`,
        );

        break;
      case "middleware":
        this.router.add("ALL", handler.path, handler);

        this.logger.info(
          "Router",
          `Mapped ${LogColor.fg.magenta + handler.path + LogColor.reset} ${
            handler.priority !== 0
              ? `<${LogColor.fg.red + handler.priority + LogColor.reset}> `
              : ""
          }to ${LogColor.fg.black + handler.target.name + LogColor.reset}`,
        );
        break;
    }
  }

  match(httpMethod: string, path: string): MatchResult {
    const result = this.convertToHandlerMatches(
      this.router.match(httpMethod, path),
    );

    // get the method of the router result
    const method = this.getMethodHandler(result);

    // get the middlewares of the router result
    const middlewares = this.getMiddlewareHandlers(result);

    return { method, middlewares };
  }

  /**
   * Get the method handler with the highest priority.
   *
   * @param matches The matches from the router
   * @returns the method handler with the highest priority or undefined if no method handler found
   */
  private getMethodHandler(
    matches: HandlerMatch[],
  ): HandlerMatch<MethodHandler> | undefined {
    return matches
      // filter for method handlers
      .filter((match): match is HandlerMatch<MethodHandler> =>
        match.handler.type === "method"
      )
      // sort by priority
      .sort((a, b) => b.handler.priority - a.handler.priority)
      // return the first element (which can be undefined if no method handler is found)
      .at(0);
  }

  /**
   * Get the middleware handlers in the right order.
   *
   * @param matches The matches from the router.
   * @returns The middleware handlers in the right order.
   */
  private getMiddlewareHandlers(
    matches: HandlerMatch[],
  ): HandlerMatch<MiddlewareHandler>[] {
    return matches
      // filter for middleware handlers
      .filter((match): match is HandlerMatch<MiddlewareHandler> =>
        match.handler.type === "middleware"
      )
      // sort by priority
      .sort((a, b) => b.handler.priority - a.handler.priority);
  }

  private convertToHandlerMatches(
    result: Result<Handler>,
  ): HandlerMatch[] {
    if (result.length === 1) {
      // map the result to handler matches
      return result[0].map(([handler, params]) => ({ handler, params }));
    } else if (result.length === 2) {
      // convert to handler matches when params stash is available (see hono router result)
      const handlers = result[0];
      const paramsStash = result[1];

      return handlers.map((
        [handler, paramsIndex],
      ) => {
        // convert params index map to params object using the stash
        const params: MatchParams = Object.fromEntries(
          Object.entries(paramsIndex).map((
            [key, value],
          ) => [key, paramsStash[value]]),
        );

        // return the handler match
        return { handler, params };
      });
    } else {
      // in case of a not matching result throw an error
      throw new Error("Unexpected router result length.");
    }
  }
}
