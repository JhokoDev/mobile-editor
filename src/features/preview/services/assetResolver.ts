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

export const resolveScriptTags = (
  html: string,
  files: VirtualFileMap
): string => {
  return html.replace(
    /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/g,
    (_, src) => {
      // Block remote scripts and absolute paths
      if (
        src.startsWith('http://') || 
        src.startsWith('https://') || 
        src.startsWith('//') ||
        src.startsWith('/')
      ) {
        return '';
      }
      
      const js = files[src];
      if (!js) return '';
      return `<script>${js}</script>`;
    }
  );
};
