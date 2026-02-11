export type TransactionStatus = 'PENDING' | 'APPLIED' | 'COMMITTED' | 'REVERTED' | 'FAILED';

export interface Transaction {
  id: string;
  status: TransactionStatus;
  description: string;
  timestamp: string;
  files: string[];
  reasoning: string;
  provider: string;
  model: string;
  cost: string;
  tokens: string;
}

export type AppTab = 'dashboard' | 'history' | 'settings';