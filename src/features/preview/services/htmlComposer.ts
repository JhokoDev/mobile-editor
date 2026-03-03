import { resolveCssLinks, resolveScriptTags } from './assetResolver';

interface VirtualFileMap {
  [path: string]: string
}

export const injectCssIntoHtml = (
  html: string,
  css: string
): string => {
  const styleTag = `<style>${css}</style>`;

  if (html.includes('</head>')) {
    return html.replace('</head>', `${styleTag}</head>`);
  }

  return `
    <html>
      <head>${styleTag}</head>
      <body>${html}</body>
    </html>
  `;
};

export const composePreviewDocument = ({
  html,
  files
}: {
  html: string
  files: VirtualFileMap
}): string => {
  let composed = html;

  composed = resolveScriptTags(composed, files);
  composed = resolveCssLinks(composed, files);

  return composed;
};
