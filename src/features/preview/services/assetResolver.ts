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
      const css = files[href];
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
      const js = files[src];
      if (!js) return match; // Keep original tag for external scripts
      return `<script>${js}</script>`;
    }
  );
};
