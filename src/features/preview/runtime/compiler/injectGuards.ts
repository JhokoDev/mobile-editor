
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
