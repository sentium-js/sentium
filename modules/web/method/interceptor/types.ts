export interface Interceptable {
  // TODO
  intercept(context: ExecutionContext): Promise<void>;
}
