import mockData from './data/mock-data.json';

// Simple in-memory store wrapper around the JSON data
class Store {
  // Use a deep clone to allow mutations without polluting import
  private transactions = JSON.parse(JSON.stringify(mockData.transactions));
  private prompts = JSON.parse(JSON.stringify(mockData.prompts));

  getTransactions(limit = 15, page = 1) {
    const start = (page - 1) * limit;
    const end = start + limit;
    return this.transactions.slice(start, end);
  }

  getPrompts() {
    return this.prompts;
  }

  updateTransactionStatus(id: string, status: string) {
    const tx = this.transactions.find((t: any) => t.id === id);
    if (tx) {
      tx.status = status;
      return tx;
    }
    return null;
  }
}

export const db = new Store();