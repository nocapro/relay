import { ClassValue } from "clsx";

export interface DiffLine {
  type: 'hunk' | 'add' | 'remove' | 'context';
  content: string;
  oldLine?: number;
  newLine?: number;
}

export interface SyntaxToken {
  text: string;
  className?: string;
}

/**
 * Parses a unified diff string into structured lines for rendering.
 */
export function parseDiff(diff: string): DiffLine[] {
  const lines = diff.split('\n');
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      // Parse hunk header: @@ -1,4 +1,5 @@
      const match = line.match(/@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
      if (match) {
        oldLine = parseInt(match[1], 10) - 1;
        newLine = parseInt(match[3], 10) - 1;
      }
      result.push({ type: 'hunk', content: line });
      continue;
    }

    if (line.startsWith('+')) {
      newLine++;
      result.push({ type: 'add', content: line.substring(1), newLine });
    } else if (line.startsWith('-')) {
      oldLine++;
      result.push({ type: 'remove', content: line.substring(1), oldLine });
    } else if (line.startsWith(' ')) {
      oldLine++;
      newLine++;
      result.push({ type: 'context', content: line.substring(1), oldLine, newLine });
    }
  }

  return result;
}

/**
 * Basic syntax highlighter for JS/TS/CSS
 */
const KEYWORDS = [
  'import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 
  'interface', 'type', 'from', 'async', 'await', 'class', 'extends', 'implements'
];

export function tokenizeCode(code: string): SyntaxToken[] {
  // Simple regex based tokenizer
  // 1. Strings
  // 2. Keywords
  // 3. Comments
  // 4. Numbers
  // 5. Normal text
  
  const tokens: SyntaxToken[] = [];
  let remaining = code;

  // Very naive splitting by word boundary, space, or special chars
  // For a production app, use PrismJS or Shiki. This is a lightweight substitute.
  const regex = /(".*?"|'.*?'|\/\/.*$|\/\*[\s\S]*?\*\/|\b\w+\b|[^\w\s])/gm;
  
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(code)) !== null) {
    // Add whitespace/text before match
    if (match.index > lastIndex) {
      tokens.push({ text: code.substring(lastIndex, match.index) });
    }

    const text = match[0];
    let className: string | undefined;

    if (text.startsWith('"') || text.startsWith("'")) {
      className = "text-emerald-300"; // String
    } else if (text.startsWith('//') || text.startsWith('/*')) {
      className = "text-zinc-500 italic"; // Comment
    } else if (KEYWORDS.includes(text)) {
      className = "text-purple-400 font-medium"; // Keyword
    } else if (/^\d+$/.test(text)) {
      className = "text-orange-300"; // Number
    } else if (/^[A-Z]/.test(text)) {
      className = "text-yellow-200"; // PascalCase (likely type/class)
    } else if (['{', '}', '(', ')', '[', ']'].includes(text)) {
      className = "text-zinc-400"; // Brackets
    }

    tokens.push({ text, className });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.substring(lastIndex) });
  }

  return tokens;
}