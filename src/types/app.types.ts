export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

export interface TransactionFile {
  path: string;
  status: 'modified' | 'created' | 'deleted' | 'renamed';
  language: string;
  diff: string;
}

// New: Prompt entity to support grouping
export interface Prompt {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export type TransactionBlock =
  | { type: 'markdown'; content: string }
  | { type: 'file'; file: TransactionFile };

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  createdAt: string;
  promptId: string;
  author: string;
  blocks: TransactionBlock[]; // New narrative structure
  files: TransactionFile[];   // Keep for compatibility/summaries
  provider: string;
  model: string;
  cost: string;
  tokens: string;
  reasoning: string; // Legacy fallback
}

// New: Grouping Strategies
export type GroupByStrategy = 'prompt' | 'date' | 'author' | 'status' | 'files' | 'none';