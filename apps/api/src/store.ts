import mockData from './data/mock-data.json';
import type { Transaction, TransactionStatus } from './models';

type Subscriber = (transaction: Transaction) => void;

// Simple in-memory store wrapper around the JSON data
class Store {
  // Use a deep clone to allow mutations without polluting import
  private transactions: Transaction[] = JSON.parse(JSON.stringify(mockData.transactions));
  private prompts = JSON.parse(JSON.stringify(mockData.prompts));
  
  // State machine tracking
  private subscribers: Set<Subscriber> = new Set();
  private activeSimulations: Set<string> = new Set();

  getTransactions(limit = 15, page = 1, search?: string, status?: string) {
    let result = [...this.transactions];

    // Defensive check against stringified "undefined" from query params
    const activeStatus = (status && status !== 'undefined' && status !== 'null') ? status : null;
    const activeSearch = (search && search !== 'undefined' && search !== 'null') ? search.trim() : null;

    if (activeStatus) {
      result = result.filter((t: any) => t.status === activeStatus);
    }

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      result = result.filter((t: any) => 
        t.description.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        (t.blocks && t.blocks.some((b: any) => 
          (b.type === 'markdown' && b.content.toLowerCase().includes(q)) ||
          (b.type === 'file' && b.file.path.toLowerCase().includes(q))
        ))
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    return result.slice(start, end);
  }

  getPrompts() {
    return this.prompts;
  }

  updateTransactionStatus(id: string, status: TransactionStatus): Transaction | null {
    const tx = this.transactions.find((t: any) => t.id === id);
    if (tx) {
      tx.status = status;
      this.notify(tx);
      return tx;
    }
    return null;
  }

  updateTransactionStatusBulk(ids: string[], status: TransactionStatus): string[] {
    const updatedIds: string[] = [];
    this.transactions.forEach((tx: any) => {
      if (ids.includes(tx.id)) {
        tx.status = status;
        this.notify(tx);
        updatedIds.push(tx.id);
      }
    });
    return updatedIds;
  }

  // Subscription system for SSE/streaming updates
  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(transaction: Transaction): void {
    this.subscribers.forEach(cb => {
      try {
        cb(transaction);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  // Simulation engine: triggers async state transition based on scenario
  async startSimulation(id: string, scenario?: 'fast-success' | 'simulated-failure' | 'long-running'): Promise<void> {
    // Prevent duplicate simulations for the same transaction
    if (this.activeSimulations.has(id)) {
      return;
    }

    const tx = this.transactions.find((t: any) => t.id === id);
    if (!tx || tx.status !== 'PENDING') {
      return;
    }

    this.activeSimulations.add(id);
    
    // Immediately transition to APPLYING
    tx.status = 'APPLYING';
    this.notify(tx);

    // Determine duration based on scenario
    let duration = 2000 + Math.random() * 4000; // Default 2-6 seconds
    if (scenario === 'fast-success') {
      duration = 500 + Math.random() * 500; // 0.5-1 seconds
    } else if (scenario === 'long-running') {
      duration = 8000 + Math.random() * 4000; // 8-12 seconds
    }

    await new Promise(resolve => setTimeout(resolve, duration));

    // Determine final status based on scenario
    if (scenario === 'simulated-failure') {
      tx.status = 'FAILED';
    } else {
      tx.status = 'APPLIED';
    }
    
    this.notify(tx);
    this.activeSimulations.delete(id);
  }
}

export const db = new Store();