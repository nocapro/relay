import { Transaction, Prompt } from '@/types/app.types';
import mockData from './mock-data.json';

// Service implementation using provided mock-data.json
export const api = {
  transactions: {
    list: async (params?: { page?: number; limit?: number }): Promise<Transaction[]> => {
      const { page = 1, limit = 15 } = params || {};
      
      // Calculate start and end indices for pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      
      // Return slice of the transactions array from mock-data.json
      // We cast to any first to bypass complex block union types for the mock data
      return (mockData.transactions as any[]).slice(start, end) as Transaction[];
    },
    prompts: {
      list: async (): Promise<Prompt[]> => {
        return mockData.prompts as Prompt[];
      }
    }
  },
  socket: {
    subscribe: (callback: (tx: Transaction) => void) => {
      // Mock socket implementation for real-time updates
      // This could be wired to a global window event for testing
      (window as any).simulateIncomingTx = (tx: Transaction) => callback(tx);
    },
    startEmitting: () => console.log("Socket monitoring started"),
    stopEmitting: () => console.log("Socket monitoring paused")
  }
};