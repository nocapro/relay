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

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string; // Display string (e.g., "Just now")
  createdAt: string; // ISO Date string for grouping/sorting
  promptId: string;  // Foreign key to Prompt
  author: string;    // For grouping by commit author
  files: TransactionFile[];
  reasoning: string;
  provider: string;
  model: string;
  cost: string;
  tokens: string;
}

// New: Grouping Strategies
export type GroupByStrategy = 'prompt' | 'date' | 'author' | 'status' | 'files' | 'none';