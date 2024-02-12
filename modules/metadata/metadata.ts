export type MetadataScope = PropertyKey;
export type MetadataOptions = {
  scope?: MetadataScope;
};

export const METADATA_KEY = Symbol.for('sentium.metadata');
export const DEFAULT_METADATA_SCOPE: MetadataScope = Symbol.for(
  'sentium.metadata.defaultScope'
);

export class Metadata<M, T extends object> {
  private readonly scope: MetadataScope;

  private constructor(
    private target: T,
    private key: PropertyKey,
    defaultValue: M,
    options: MetadataOptions
  ) {
    this.scope = options.scope ?? DEFAULT_METADATA_SCOPE;
    if (!this.record[this.key]) this.value = defaultValue;
  }

  set value(value: M) {
    this.record[this.key] = value;
  }

  get value(): M {
    return this.record[this.key] as M;
  }

  private get record(): Record<PropertyKey, M> {
    let meta = Object.getOwnPropertyDescriptor(this.target, METADATA_KEY)?.value;

    if (!meta) {
      meta = {};
      Object.defineProperty(this.target, METADATA_KEY, { value: meta, enumerable: false });
    }

    let rec = meta[this.scope];

    if (!rec) {
      rec = {};
      meta[this.scope] = rec;
    }

    return rec;
  }

  static of<M = unknown, T extends object = object>(
    target: T,
    key: PropertyKey,
    defaultValue: M,
    options: MetadataOptions = {}
  ): Metadata<M, T> {
    return new Metadata<M, T>(target, key, defaultValue, options);
  }

  static get<M, T extends object = object>(
    target: T,
    key: PropertyKey,
    scope: MetadataScope = DEFAULT_METADATA_SCOPE
  ): M | undefined {
    return new Metadata<M | undefined, T>(target, key, undefined, { scope }).value;
  }

  static set<M, T extends object = object>(
    target: T,
    key: PropertyKey,
    value: M,
    scope: MetadataScope = DEFAULT_METADATA_SCOPE
  ): void {
    new Metadata<M, T>(target, key, value, { scope }).value = value;
  }
}
