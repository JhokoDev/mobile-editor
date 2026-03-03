
export type TokenType = 
  | 'tag' 
  | 'attr-name' 
  | 'attr-value' 
  | 'comment' 
  | 'doctype' 
  | 'text' 
  | 'punctuation'
  | 'operator';

export interface Token {
  type: TokenType;
  value: string;
}

export const tokenizeHTML = (code: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // Comments
    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4);
      if (end === -1) {
        tokens.push({ type: 'comment', value: code.slice(i) });
        break;
      }
      tokens.push({ type: 'comment', value: code.slice(i, end + 3) });
      i = end + 3;
      continue;
    }

    // Doctype
    if (code.startsWith('<!', i)) {
      const end = code.indexOf('>', i + 2);
      if (end === -1) {
        tokens.push({ type: 'doctype', value: code.slice(i) });
        break;
      }
      tokens.push({ type: 'doctype', value: code.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Tags
    if (char === '<') {
      const end = code.indexOf('>', i);
      if (end === -1) {
        tokens.push({ type: 'punctuation', value: '<' });
        i++;
        continue;
      }

      const tagContent = code.slice(i + 1, end);
      tokens.push({ type: 'punctuation', value: '<' });
      
      // Simple tag content tokenizer (attributes)
      const tagParts = tagContent.match(/([^\s=]+)|(=)|("[^"]*")|('[^']*')/g) || [];
      let isFirst = true;
      
      for (const part of tagParts) {
        if (isFirst) {
          tokens.push({ type: 'tag', value: part });
          isFirst = false;
        } else if (part === '=') {
          tokens.push({ type: 'operator', value: '=' });
        } else if (part.startsWith('"') || part.startsWith("'")) {
          tokens.push({ type: 'attr-value', value: part });
        } else {
          tokens.push({ type: 'attr-name', value: part });
        }
      }

      tokens.push({ type: 'punctuation', value: '>' });
      i = end + 1;
      continue;
    }

    // Text nodes
    const nextTag = code.indexOf('<', i);
    if (nextTag === -1) {
      tokens.push({ type: 'text', value: code.slice(i) });
      break;
    } else {
      tokens.push({ type: 'text', value: code.slice(i, nextTag) });
      i = nextTag;
    }
  }

  return tokens;
};
