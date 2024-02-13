import { Body } from "./types.ts";

export type ExecutionContext<Req extends Request = Request, Env = unknown> = {
  req: ExecutionRequest<Req>;
  res: ExecutionResponse;
  env: Env;
  meta: Map<string, unknown>;
};

export class ExecutionRequest<Raw extends Request> {
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

export class ExecutionResponse {
  private _headers: Headers;
  private _status: number;
  private _body: Body;

  constructor() {
    this._headers = new Headers();
    this._status = 200;
    this._body = undefined;
  }

  status(value: number): ExecutionResponse {
    this._status = value;
    return this;
  }

  header(key: string, value: string): ExecutionResponse {
    this._headers.set(key, value);
    return this;
  }

  body(value: Body): ExecutionResponse {
    this._body = value;
    return this;
  }

  toResponse(): Response {
    return new Response(this._body, {
      headers: this._headers,
      status: this._status,
    });
  }
}
