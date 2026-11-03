/** Collapses a trailing slash so `/products/` and `/products` compare equal. */
export function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}
