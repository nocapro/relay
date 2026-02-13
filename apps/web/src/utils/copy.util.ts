import { Transaction } from "@/types/app.types";

export interface ReportOptions {
  description: boolean;
  metadata: boolean;
  files: boolean;
  diffs: boolean;
  reasoning: boolean;
}

export const generateGranularReport = (
  transactions: Transaction[], 
  options: ReportOptions
): string => {
  if (!transactions.length) return '';

  const report = transactions.map(t => {
    let section = '';
    
    // Header & Metadata
    if (options.description || options.metadata) {
      const parts: string[] = [];
      if (options.description) parts.push(`### ${t.description} (${t.id})`);
      if (options.metadata) {
        parts.push(`**Status**: ${t.status} | **Author**: ${t.author} | **Time**: ${t.timestamp}`);
        if (t.tokens) parts.push(`**Tokens**: ${t.tokens} | **Cost**: ${t.cost}`);
      }
      if (parts.length) section += parts.join('\n') + '\n\n';
    }

    // Reasoning
    if (options.reasoning && t.reasoning) {
      section += `#### Reasoning:\n> ${t.reasoning}\n\n`;
    }

    // Files List
    if (options.files) {
      const files = (t.files || []).map(f => `- [${f.status.toUpperCase()}] ${f.path}`).join('\n');
      if (files) section += `#### Files Affected:\n${files}\n\n`;
    }

    // File Content / Diffs
    if (options.diffs && t.blocks) {
      const content = t.blocks.map(b => {
        if (b.type === 'file' && b.file) {
          return `File: ${b.file.path}\n\`\`\`${b.file.language}\n${b.file.diff}\n\`\`\``;
        }
        return '';
      }).filter(Boolean).join('\n\n');
      
      if (content) section += `#### Changes:\n${content}\n\n`;
    }

    return section.trim();
  }).join('\n\n---\n\n');

  return `# Transaction Report\nGenerated: ${new Date().toLocaleString()}\n\n${report}`;
};