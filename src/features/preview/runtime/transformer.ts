
export interface VirtualFileMap {
  [path: string]: string;
}

/**
 * Normalizes a path by removing leading ./ or /
 */
const normalizePath = (path: string): string => {
  return path.replace(/^\.\//, '').replace(/^\//, '');
};

/**
 * Checks if a URL is remote (starts with http://, https://, or //)
 */
const isRemote = (url: string): boolean => {
  return /^(https?:)?\/\//.test(url);
};

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

/**
 * Resolves local stylesheet links by inlining their content.
 * Removes remote stylesheets and links with missing local files.
 */
export const resolveStyles = (html: string, files: VirtualFileMap): string => {
  return html.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
    if (isRemote(href)) {
      return ''; // Remove remote stylesheets
    }
    const cleanHref = normalizePath(href);
    const content = files[cleanHref] || files[href];
    if (content !== undefined) {
      return `<style>${content}</style>`;
    }
    return ''; // Remove missing local files
  });
};

/**
 * Sanitizes HTML by removing potentially dangerous or unwanted tags.
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<base[^>]*>/gi, '')
    .replace(/<meta\s+http-equiv=[^>]*>/gi, '')
    // Also remove any remaining remote scripts/links that might have escaped previous steps
    .replace(/<script\s+[^>]*src=["']https?:\/\/[^"']+["'][^>]*><\/script>/gi, '')
    .replace(/<link\s+[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi, '');
};

/**
 * Injects network blocking guards.
 */
export const injectSecurityGuards = (html: string): string => {
  const guardScript = `
<script>
(function() {
  window.fetch = () => Promise.reject(new Error("Network disabled"));
  window.XMLHttpRequest = function() {
    throw new Error("Network disabled");
  };
  // Prevent access to parent
  Object.defineProperty(window, 'parent', { get: () => window });
  Object.defineProperty(window, 'top', { get: () => window });
})();
</script>`;

  // Inject at the very beginning of the head or html
  if (html.includes('<head>')) {
    return html.replace('<head>', '<head>' + guardScript);
  }
  if (html.includes('<html>')) {
    return html.replace('<html>', '<html>' + guardScript);
  }
  return guardScript + html;
};

/**
 * Injects console and error bridge for monitoring.
 */
export const injectBridge = (html: string): string => {
  const bridgeScript = `
<script>
(function() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  const sendToParent = (type, payload) => {
    window.parent.postMessage({ type, payload }, "*");
  };

  console.log = (...args) => {
    sendToParent("console-log", args.map(String));
    originalLog(...args);
  };
  console.error = (...args) => {
    sendToParent("console-error", args.map(String));
    originalError(...args);
  };
  console.warn = (...args) => {
    sendToParent("console-warn", args.map(String));
    originalWarn(...args);
  };
  console.info = (...args) => {
    sendToParent("console-info", args.map(String));
    originalInfo(...args);
  };

  window.onerror = function(message, source, lineno, colno, error) {
    sendToParent("error", { 
      message: String(message), 
      lineno, 
      colno,
      stack: error ? error.stack : null
    });
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    sendToParent("error", { 
      message: "Unhandled Rejection: " + String(event.reason),
      stack: event.reason ? event.reason.stack : null
    });
  });
})();
</script>`;

  // Inject after security guards
  if (html.includes('</head>')) {
    return html.replace('</head>', bridgeScript + '</head>');
  }
  return html + bridgeScript;
};

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
