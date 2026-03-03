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
