
/**
 * Normalizes a path by removing leading ./ or /
 */
export const normalizePath = (path: string): string => {
  return path.replace(/^\.\//, '').replace(/^\//, '');
};

/**
 * Checks if a URL is remote (starts with http://, https://, or //)
 */
export const isRemote = (url: string): boolean => {
  return /^(https?:)?\/\//.test(url);
};
