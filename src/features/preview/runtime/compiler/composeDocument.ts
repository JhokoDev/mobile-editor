
import { VirtualFileMap } from '../../../../preview/types';
import { resolveScripts } from './resolveScripts';
import { resolveStyles } from './resolveStyles';
import { sanitizeHtml } from './sanitizeHtml';
import { injectSecurityGuards } from './injectGuards';
import { injectBridge } from './injectBridge';

/**
 * Composes the final preview document by applying all transformations.
 */
export const composePreviewDocument = (html: string, files: VirtualFileMap): string => {
  let doc = html;
  
  // Ensure we have a basic structure if missing
  if (!doc.includes('<html')) {
    doc = `<!DOCTYPE html><html><head></head><body>${doc}</body></html>`;
  } else if (!doc.includes('<head')) {
    doc = doc.replace('<html>', '<html><head></head>');
  }

  doc = resolveScripts(doc, files);
  doc = resolveStyles(doc, files);
  doc = sanitizeHtml(doc);
  doc = injectSecurityGuards(doc);
  doc = injectBridge(doc);
  
  return doc;
};
