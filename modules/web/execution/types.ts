import { InjectableScope } from "../../injectable/mod.ts";
import { Logger } from "../logger/logger.ts";
import { HandlerMatch } from "../router/types.ts";
import {
  MatchResult,
  MethodHandler,
  MiddlewareHandler,
} from "../router/types.ts";
import { GetTagFunction } from "../tag/types.ts";

export type Body = BodyInit | null | undefined;

export type Context<Req extends Request = Request, Env = unknown> = {
  /**
   * The incoming request with access to the raw request from the adapter.
   */
  readonly req: HttpRequest<Req>;

  /**
   * The response which will be sent to the client but can be modified before as desired.
   */
  readonly res: HttpResponse;

  /**
   * The environment variables which gets injected by the adapter.
   */
  readonly env: Env;

  /**
   * A map with arbitrary data which can be used to store data during the request.
   */
  readonly data: Map<PropertyKey, unknown>;

  /**
   * The injection scope which is used to resolve dependencies.
   *
   * This can be set in the router.
   */
  readonly scope: InjectableScope;

  /**
   * The logger which can be used to log messages.
   */
  readonly logger: Logger;

  /**
   * The method handler that matched the request.
   */
  method?: HandlerMatch<MethodHandler>;

  /**
   * List of all middleware handlers that matched the request and will be called in order.
   */
  middlewares: HandlerMatch<MiddlewareHandler>[];

  /**
   * The current handler which gets called currently.
   */
  current: HandlerMatch;

  /**
   * Get a tag from the current method or controller.
   *
   * @param tag The tag to get.
   * @param mode The mode to get the tag. Following modes are available:
   *
   * `method` - Get the tag manager for the current method.
   *
   * `controller` - Get the tag manager for the current controller.
   *
   * `method-first` - Get the tag manager for the current method and controller.
   *  Method tags have priority. (*default*)
   *
   * `controller-first` - Get the tag manager for the current method and controller.
   *  Controller tags have priority.
   *
   * @returns The tag manager for the selected type.
   */
  getTag: GetTagFunction;
};

export class HttpRequest<Raw extends Request = Request> {
  constructor(private _request: Raw, private _params: Record<string, string>) {}

  param(name: string): string | null {
    return this.params[name] ?? null;
  }

  query(name: string): string | null {
    return this.queries.get(name);
  }

  header(name: string): string | null {
    return this.headers.get(name);
  }

  json<T = unknown>(): Promise<T> {
    return this._request.json();
  }

  text(): Promise<string> {
    this._request.headers.getSetCookie;
    return this._request.text();
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this._request.arrayBuffer();
  }

  formData(): Promise<FormData> {
    return this._request.formData();
  }

  blob(): Promise<Blob> {
    return this._request.blob();
  }

  get queries(): URLSearchParams {
    return this.url.searchParams;
  }

  get params(): Record<string, string> {
    return this._params;
  }

  get headers(): Headers {
    return this._request.headers;
  }

  get body(): Body {
    return this._request.body;
  }

  get url(): URL {
    return new URL(this._request.url);
  }

  get path(): string {
    return this.url.pathname;
  }

  get raw(): Raw {
    return this._request;
  }
}

export class HttpResponse {
  headers: Headers;
  status: number;
  body: Body;

  constructor() {
    this.headers = new Headers();
    this.status = 200;
    this.body = undefined;
  }

  header(key: string, value: string): HttpResponse {
    this.headers.set(key, value);
    return this;
  }

  json<T = unknown>(json: T): HttpResponse {
    this.headers.set("Content-Type", "application/json");
    this.body = JSON.stringify(json);
    return this;
  }

  text(text: string): HttpResponse {
    this.headers.set("Content-Type", "text/plain");
    this.body = text;
    return this;
  }

  toResponse(): Response {
    return new Response(this.body, {
      headers: this.headers,
      status: this.status,
    });
  }
}

export type ExecutionOptions = {
  request: Request;
  matches: MatchResult;
  scope: InjectableScope;
  env: unknown;
};
