export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

export interface TransactionFile {
  path: string;
  status: 'modified' | 'created' | 'deleted' | 'renamed';
  language: string;
  diff: string;
}

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  files: TransactionFile[];
  reasoning: string;
  provider: string;
  model: string;
  cost: string;
  tokens: string;
}

export type AppTab = 'dashboard' | 'history' | 'settings';