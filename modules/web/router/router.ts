import { RegExpRouter, Result, SmartRouter, TrieRouter } from "./hono.ts";
import { HandlerInfo, MatchResult } from "./types.ts";

/**
 * A fast url router which supports trie and regex (a superset of the hono router).
 */
export class Router {
  private router: SmartRouter<HandlerInfo>;

  constructor() {
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

  add(handler: HandlerInfo) {
    switch (handler.type) {
      case "method":
        this.router.add(handler.method, handler.path, handler);
        break;
      case "middleware":
        this.router.add("ALL", handler.path, handler);
        break;
    }
  }

  match(method: string, path: string): MatchResult {
    const result = this.router.match(method, path);

    // TODO implement

    throw new Error("Not implemented");
  }
}
