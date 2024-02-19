import { Class, Method } from "../utils/types.ts";
import { GetTagMode, TagMetadata } from "./types.ts";
import { Metadata } from "../metadata/metadata.ts";

const TAG_METADATA_KEY = Symbol.for("sentium.tag");

export class TagManager<Target extends Class | Method = Class | Method> {
  private readonly metadata: Metadata<TagMetadata, Target>;

  constructor(target: Target) {
    this.metadata = Metadata.of<TagMetadata, Target>(target, TAG_METADATA_KEY, {
      tags: new Map(),
    });
  }

  /**
   * Set a tag with a given value.
   *
   * @param tag The tag key.
   * @param value The tag value.
   */
  set(tag: PropertyKey, value: unknown): void {
    this.metadata.value.tags.set(tag, value);
  }

  /**
   * Get a tag value.
   *
   * @param tag The tag key.
   * @returns The tag value or undefined if the tag does not exist.
   */
  get<T = unknown>(tag: PropertyKey): T | undefined {
    return this.metadata.value.tags.get(tag) as T;
  }

  /**
   * Check if a tag exists.
   *
   * @param tag The tag key.
   * @returns true if the tag exists, false otherwise.
   */
  has(tag: PropertyKey): boolean {
    return this.metadata.value.tags.has(tag);
  }

  /**
   * Delete a tag.
   *
   * @param tag The tag key.
   * @returns true if the tag was deleted, false if the tag does not exist.
   */
  delete(tag: PropertyKey): boolean {
    return this.metadata.value.tags.delete(tag);
  }

  /**
   * Clear all tags.
   */
  clear(): void {
    this.metadata.value.tags.clear();
  }

  /**
   * Get all tags.
   *
   * @returns An iterator of all tags.
   */
  tags(): IterableIterator<PropertyKey> {
    return this.metadata.value.tags.keys();
  }

  /**
   * Get all tag values.
   *
   * @returns An iterator of all tag values.
   */
  entries(): IterableIterator<[PropertyKey, unknown]> {
    return this.metadata.value.tags.entries();
  }

  /**
   * Get all tag entries (key-value pairs).
   *
   * @returns An iterator of all tag entries.
   */
  values(): IterableIterator<unknown> {
    return this.metadata.value.tags.values();
  }

  // make the TagManager iterable
  [Symbol.iterator](): IterableIterator<[PropertyKey, unknown]> {
    return this.metadata.value.tags[Symbol.iterator]();
  }

  /**
   * Get the tag manager for a given target.
   *
   * @param target The target class or method.
   * @returns The tag manager for the given target.
   */
  static of<Target extends Class | Method>(
    target: Target,
  ): TagManager<Target> {
    return new TagManager(target);
  }
}

export const getTag = <T>(
  tag: PropertyKey,
  mode: GetTagMode = "method-first",
  method?: Method,
  controller?: Class,
): T | undefined => {
  const methodTags = method ? TagManager.of(method) : undefined;
  const controllerTags = controller ? TagManager.of(controller) : undefined;

  switch (mode) {
    case "method":
      return methodTags?.get<T>(tag);
    case "controller":
      return controllerTags?.get<T>(tag);
    case "method-first":
      return methodTags?.get<T>(tag) ?? controllerTags?.get<T>(tag);
    case "controller-first":
      return controllerTags?.get<T>(tag) ?? methodTags?.get<T>(tag);
  }
};
