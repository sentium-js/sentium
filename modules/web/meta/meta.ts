// import { Class, Method } from "../../common/mod.ts";
// import { Metadata } from "../../metadata/mod.ts";
// import { MetaMap, MetaMetadata, MetaValue } from "./types.ts";

// export const CONTROLLER_META_METADATA_KEY = Symbol.for(
//   "sentium.controller.meta",
// );

// export class Meta<
//   Target extends Class | Method,
//   M extends MetaMap = MetaMap,
// > {
//   private readonly metadata: Metadata<MetaMetadata, Target>;

//   constructor(public readonly target: Target) {
//     this.metadata = Metadata.of<MetaMetadata, Target>(
//       target,
//       CONTROLLER_META_METADATA_KEY,
//       { map: new Map() },
//     );
//   }

//   get targetType(): "class" | "method" {
//     return this.target.prototype === undefined ? "method" : "class";
//   }

//   default<Key extends keyof M>(key: Key, value: MetaValue<M, Key>): void {
//     if (!this.metadata.value.map.has(key)) {
//       this.metadata.value.map.set(key, value);
//     }
//   }

//   set<Key extends keyof M>(key: Key, value: MetaValue<M, Key>): void {
//     this.metadata.value.map.set(key, value);
//   }

//   get<Key extends keyof M>(key: Key): MetaValue<M, Key> {
//     return this.metadata.value.map.get(key) as MetaValue<M, Key>;
//   }

//   has<Key extends keyof M>(key: Key): boolean {
//     return this.metadata.value.map.has(key);
//   }

//   static of<Target extends Class | Method, M extends MetaMap>(
//     target: Target,
//   ): Meta<Target, M> {
//     return new Meta(target);
//   }

//   static set<
//     Target extends Class | Method,
//     M extends MetaMap,
//     Key extends keyof M,
//   >(
//     target: Target,
//     key: Key,
//     value: MetaValue<M, Key>,
//   ): void {
//     Meta.of<Target, M>(target).set(key, value);
//   }

//   static get<
//     Target extends Class | Method,
//     M extends MetaMap,
//     Key extends keyof M,
//   >(
//     target: Target,
//     key: Key,
//   ): MetaValue<M, Key> {
//     return Meta.of<Target, M>(target).get(key);
//   }
// }
