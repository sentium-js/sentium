import { Context } from "../../execution/types.ts";
import { MaybePromise } from "../../utils/types.ts";

export interface Interceptable {
  intercept(
    context: Context,
    next: () => MaybePromise<unknown>,
  ): MaybePromise<unknown>;
}
