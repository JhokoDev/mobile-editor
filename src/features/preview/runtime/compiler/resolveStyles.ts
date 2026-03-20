
import { VirtualFileMap } from '../../../../preview/types';
import { normalizePath, isRemote } from './utils';

/**
 * Resolves local stylesheet links by inlining their content.
 * Removes remote stylesheets and links with missing local files.
 */
export const resolveStyles = (html: string, files: VirtualFileMap): string => {
  return html.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    if (isRemote(href)) {
      return match; // Keep remote stylesheets
    }
    const cleanHref = normalizePath(href);
    const content = files[cleanHref] || files[href];
    if (content !== undefined) {
      return `<style>${content}</style>`;
    }
    return match; // Keep original tag if file not found locally
  });
};
