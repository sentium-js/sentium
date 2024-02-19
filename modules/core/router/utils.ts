/**
 * Join together multiple path segments into a single path.
 *
 * @param paths The path segments to join together.
 * @returns The joined path with a leading slash, without duplicate slashes and without trailing slashes.
 */
export const joinPaths = (...paths: string[]): string => {
  return ["", ...paths].join("/").replace(/\/+/g, "/").replace(/\/$/, "") ||
    "/";
};

/**
 * Create a wildcard path from a base path.
 * The wildcard path is the base path with a `*` at the end.
 *
 * @param basePath The base path to create the wildcard path from.
 * @returns The wildcard path with a asterisk at the end.
 */
export const createWildcardPath = (basePath: string): string => {
  return joinPaths(basePath, "*");
};
