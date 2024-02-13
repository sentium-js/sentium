import { MaybePromise } from "../../../common/mod.ts";
import { ExecutionContext } from "../../handler/context.ts";

export interface Interceptable {
  intercept(
    context: ExecutionContext,
    next: () => MaybePromise<unknown>,
  ): MaybePromise<unknown>;
}
