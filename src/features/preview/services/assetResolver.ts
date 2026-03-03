interface VirtualFileMap {
  [path: string]: string
}

export const resolveCssLinks = (
  html: string,
  files: VirtualFileMap
): string => {
  return html.replace(
    /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/g,
    (match, href) => {
      // Normalize href: remove leading ./ or /
      const cleanHref = href.replace(/^\.\//, '').replace(/^\//, '');
      const css = files[cleanHref] || files[href];
      if (!css) return match; // Keep original tag for external links
      return `<style>${css}</style>`;
    }
  );
};

export const resolveScriptTags = (
  html: string,
  files: VirtualFileMap
): string => {
  return html.replace(
    /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/g,
    (match, src) => {
      // Normalize src: remove leading ./ or /
      const cleanSrc = src.replace(/^\.\//, '').replace(/^\//, '');
      const js = files[cleanSrc] || files[src];
      if (!js) return match; // Keep original tag for external scripts
      return `<script>${js}</script>`;
    }
  );
};
