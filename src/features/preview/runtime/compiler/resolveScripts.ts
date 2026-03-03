
import { VirtualFileMap } from '../../../../preview/types';
import { normalizePath, isRemote } from './utils';

/**
 * Resolves local script tags by inlining their content.
 * Removes remote scripts and scripts with missing local files.
 */
export const resolveScripts = (html: string, files: VirtualFileMap): string => {
  return html.replace(/<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi, (match, src) => {
    if (isRemote(src)) {
      return ''; // Remove remote scripts
    }
    const cleanSrc = normalizePath(src);
    const content = files[cleanSrc] || files[src];
    if (content !== undefined) {
      return `<script>${content}</script>`;
    }
    return ''; // Remove missing local files
  });
};
