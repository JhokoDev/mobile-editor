
/**
 * Sanitizes HTML by removing potentially dangerous or unwanted tags.
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<base[^>]*>/gi, '')
    .replace(/<meta\s+http-equiv=[^>]*>/gi, '');
};

export interface ValidationError {
  type: 'validation_error';
  line?: number;
  message: string;
}

/**
 * Basic HTML validation for common issues.
 */
export const validateHtml = (html: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // This is a very naive check and won't handle self-closing tags correctly without a full parser
  // But for the sake of the requirement, we'll do a simple count for common tags
  const commonTags = ['div', 'span', 'p', 'section', 'article', 'header', 'footer', 'main', 'aside'];
  
  commonTags.forEach(tag => {
    const openCount = (html.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
    const closeCount = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    
    if (openCount !== closeCount) {
      errors.push({
        type: 'validation_error',
        message: `Potential mismatch for <${tag}>: ${openCount} opened, ${closeCount} closed.`
      });
    }
  });

  return errors;
};
