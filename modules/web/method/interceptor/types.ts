import { MaybePromise } from "../../../common/mod.ts";
import { Context } from "../../execution/types.ts";

export interface Interceptable {
  intercept(
    context: Context,
    next: () => MaybePromise<unknown>,
  ): MaybePromise<unknown>;
}
