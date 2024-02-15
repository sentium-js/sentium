export type TagMetadata = {
  tags: Map<PropertyKey, unknown>;
};

export type GetTagMode =
  | "method"
  | "controller"
  | "method-first"
  | "controller-first";

export type GetTagFunction = <T>(
  tag: PropertyKey,
  mode?: GetTagMode,
) => T | undefined;
