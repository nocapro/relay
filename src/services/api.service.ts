import { Transaction, Prompt } from "@/types/app.types";
import mockData from "./mock-data.json";

// --- Mock Data ---

const MOCK_PROMPTS: Prompt[] = mockData.prompts as Prompt[];
const MOCK_TRANSACTIONS: Transaction[] = mockData.transactions as Transaction[];

// --- Event System for "Live" Simulation ---
type TransactionCallback = (tx: Transaction) => void;

class TransactionSocket {
  private subscribers: TransactionCallback[] = [];
  private interval: any;

  subscribe(callback: TransactionCallback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Simulates finding a new patch in the clipboard
  startEmitting() {
    if (this.interval) return;
    const promptIds = MOCK_PROMPTS.map(p => p.id);
    this.interval = setInterval(() => {
      // In a real app, this would be data from the backend/clipboard
      const randomTx = MOCK_TRANSACTIONS[Math.floor(Math.random() * MOCK_TRANSACTIONS.length)];
      const newTx: Transaction = { 
        ...randomTx, 
        id: `tx-${Math.random().toString(36).substr(2, 6)}`, 
        promptId: promptIds[Math.floor(Math.random() * promptIds.length)],
        timestamp: 'Just now', 
        createdAt: new Date().toISOString(),
        status: 'PENDING' as const 
      };
      this.subscribers.forEach(cb => cb(newTx));
    }, 8000); // New patch every 8 seconds
  }

  stopEmitting() {
    clearInterval(this.interval);
    this.interval = null;
  }
}

// --- API Client ---
export const api = {
  socket: new TransactionSocket(),
  transactions: {
    list: async (): Promise<Transaction[]> => {
      return MOCK_TRANSACTIONS;
    },
    prompts: {
      list: async (): Promise<Prompt[]> => MOCK_PROMPTS,
      get: async (id: string) => MOCK_PROMPTS.find(p => p.id === id)
    },
    updateStatus: async (id: string, status: Transaction['status']) => {
      console.log(`[API] Updating transaction ${id} to ${status}`);
      return { success: true };
    }
  }
};