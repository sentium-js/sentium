import { InjectableScope } from "../../injectable/mod.ts";
import { Logger } from "../logger/logger.ts";
import { HandlerMatch } from "../router/types.ts";
import {
  Handler,
  MatchResult,
  MethodHandler,
  MiddlewareHandler,
} from "../router/types.ts";

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
};

export class HttpRequest<Raw extends Request> {
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
  private _headers: Headers;
  private _status: number;
  private _body: Body;

  constructor() {
    this._headers = new Headers();
    this._status = 200;
    this._body = undefined;
  }

  status(value: number): HttpResponse {
    this._status = value;
    return this;
  }

  header(key: string, value: string): HttpResponse {
    this._headers.set(key, value);
    return this;
  }

  body(value: Body): HttpResponse {
    this._body = value;
    return this;
  }

  json<T = unknown>(json: T): HttpResponse {
    this._headers.set("Content-Type", "application/json");
    this._body = JSON.stringify(json);
    return this;
  }

  toResponse(): Response {
    return new Response(this._body, {
      headers: this._headers,
      status: this._status,
    });
  }
}

export type ExecutionOptions = {
  request: Request;
  matches: MatchResult;
  scope: InjectableScope;
  env: unknown;
};