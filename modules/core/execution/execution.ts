import { Logger } from "../logger/logger.ts";
import { Interceptable } from "../method/interceptor/types.ts";
import { ParamInjects } from "../method/param/types.ts";
import { HandlerMatch, MiddlewareHandler } from "../router/types.ts";
import {
  Context,
  ExecutionOptions,
  HttpRequest,
  HttpResponse,
} from "./types.ts";
import { MethodManager } from "../method/manager.ts";
import { LogColor } from "../logger/colors.ts";
import { getTag } from "../tag/tag.ts";
import { MaybePromise } from "../utils/types.ts";
import { resolve, resolveAsync } from "../injectable/resolver.ts";

export const executeHandlers = async (
  options: ExecutionOptions,
): Promise<Response> => {
  const logger = resolve(Logger, options.scope);

  const url = new URL(options.request.url);

  logger.debug(
    "Execution",
    `Handling request: ${
      LogColor.fg.magenta + options.request.method + " " + url.pathname +
      LogColor.reset
    }`,
  );

  // generate the context for the request
  const context = generateContext(options);

  await call(context).catch((err) => {
    logger.error("Execution", "Error during request handling:", err);
    return callErrorHandler(context, err);
  });

  // after the handler chain the response is returned
  return context.res.toResponse();
};

/**
 * Generate the context for the request.
 *
 * @param options The execution options.
 * @param current The current handler which should be the first handler here.
 * @returns The generated context for the request.
 */
const generateContext = (
  { request, matches, env, scope, notFoundHandler, errorHandler }:
    ExecutionOptions,
): Context => {
  return {
    req: new HttpRequest(request, matches.method?.params ?? {}),
    res: new HttpResponse(),

    data: new Map(),
    env,
    scope,
    logger: resolve(Logger, scope),
    getTag: (tag, mode) =>
      getTag(
        tag,
        mode,
        matches.method?.handler.target,
        matches.method?.handler.controller,
      ),

    method: matches.method,
    middlewares: matches.middlewares,

    current: matches.middlewares.at(0) ?? matches.method,

    notFoundHandler,
    errorHandler,
  };
};

/**
 * Determine the next handler to call in the chain based on the current handler.
 *
 * @param context The execution context of the request.
 * @param current The current handler which was called.
 * @returns The next handler to call or undefined if no next handler exists.
 */
const determineNextHandler = (
  context: Context,
  current: HandlerMatch<MiddlewareHandler>,
): HandlerMatch | undefined => {
  const middlewares = context.middlewares;
  const method = context.method;

  // determine the index of the current handler in the list
  const index = middlewares.indexOf(current);

  // if the current handler is not found in the list it is corrupted
  if (index === -1) {
    throw new Error(
      "Middleware list is corrupted! Current middleware is not found in the list.",
    );
  }

  // get the next middleware which can be undefined if the current middleware is the last one
  const nextMiddleware = middlewares.at(index + 1);

  // return the next middleware if exists or the method handler which also can be undefined (means no next handler)
  return nextMiddleware ?? method;
};

const call = async (
  context: Context,
): Promise<void> => {
  // the current handler which should be called
  const current = context.current;

  if (!current) {
    // if there is no current handler call the not found handler
    await callNotFoundHandler(context as Context<Request, undefined>);
  } else if (current.handler.type === "method") {
    // resolve the interceptors
    const interceptors = await Promise.all(
      current.handler.interceptors
        // resolve the interceptors with the current scope
        .map((
          interceptorClass,
        ) => resolveAsync(interceptorClass, context.scope)),
    );

    // resolve the controller instance
    const controllerInstance = await resolveAsync(
      current.handler.controller,
      context.scope,
    );

    // bind the method to the controller instance
    const method = current.handler.target.bind(controllerInstance);

    // get the method manager for the method params
    const methodManager = new MethodManager(current.handler.target);

    // resolve the params for the method
    const methodParams = await resolveParams(
      context,
      methodManager.params,
    );

    // call the method with the interceptors
    const result = await callMethod(
      context,
      interceptors,
      () => method(...methodParams),
    );

    // handle the method result and add it correctly to the response
    await handleResult(context, result);

    // here the last handler was called and the recursion ends
  } else if (current.handler.type === "middleware") {
    // resolve the middleware instance
    const middleware = await resolveAsync(
      current.handler.target,
      context.scope,
    );

    // the next function which calls the next middleware in the chain
    const next = async (): Promise<void> => {
      // determine the next handler to call
      const nextHandler = determineNextHandler(
        context,
        // the current handler is here always a middleware handler
        current as HandlerMatch<MiddlewareHandler>,
      );

      // set the next handler as the current handler
      context.current = nextHandler;

      // call the next handler
      await call(context);
    };

    // call the middleware with the next function
    await middleware.handle(context, next);
  }
};

/**
 * Call the method with the given intercepters.
 *
 * @param context The execution context of the request.
 * @param interceptors The intercepters to call before the method.
 * @param method The actual final method to call.
 * @returns The result of the method after the intercepters.
 */
const callMethod = (
  context: Context,
  interceptors: Interceptable[],
  method: () => MaybePromise<unknown>,
): MaybePromise<unknown> => {
  // if there are no interceptors left call the method
  if (interceptors.length === 0) {
    return method();
  } else {
    // shift the next interceptor from the array
    const next = interceptors.shift();
    if (!next) throw new Error("Unexpected empty interceptors array");

    // call the next interceptor
    return next.intercept(
      context,
      // provide the next function which calls down the interceptor chain
      () => callMethod(context, interceptors, method),
    );
  }
};

const callNotFoundHandler = async (
  context: Context<Request, undefined>,
) => {
  const handler = await resolveAsync(context.notFoundHandler, context.scope);
  await handler.onNotFound(context);
};

const callErrorHandler = async (
  context: Context<Request, HandlerMatch | undefined>,
  error: unknown,
) => {
  const handler = await resolveAsync(context.errorHandler, context.scope);
  await handler.onError(context, error);
};

/**
 * Transform the result of the method to the response body.
 * Here the response type header will be determined and the result will be added to the response.
 *
 * @param context The execution context of the request.
 * @param result The result of the method.
 * @returns A promise which resolves after the result was added to the response.
 */
const handleResult = (
  context: Context,
  result: unknown,
): Promise<void> => {
  // TODO here should be the logic to determine the response type
  // TODO for now we always interpret the result as json
  context.res.json(result);

  return Promise.resolve();
};

/**
 * Resolve the params which the method needs.
 *
 * @param context The execution context of the request.
 * @param params The list of parameters (param resolver) to resolve.
 * @returns The resolved parameters.
 */
const resolveParams = (
  context: Context,
  params: ParamInjects,
): Promise<unknown[]> => {
  return Promise.all(params.map((param) => param(context)));
};
