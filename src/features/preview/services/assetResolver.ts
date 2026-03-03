interface VirtualFileMap {
  [path: string]: string
}

export const resolveCssLinks = (
  html: string,
  files: VirtualFileMap
): string => {
  return html.replace(
    /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/g,
    (_, href) => {
      const css = files[href];
      if (!css) return '';
      return `<style>${css}</style>`;
    }
  );
};
