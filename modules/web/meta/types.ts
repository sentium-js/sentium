export type MetaKey = PropertyKey;

export type MetaMap = Record<MetaKey, unknown>;

export type MetaValue<Map extends MetaMap, Key extends keyof Map> = Map[Key];

export type MetaMetadata = {
  map: Map<MetaKey, unknown>;
};
