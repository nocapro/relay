import mockData from './data/mock-data.json';

// Simple in-memory store wrapper around the JSON data
class Store {
  // Use a deep clone to allow mutations without polluting import
  private transactions = JSON.parse(JSON.stringify(mockData.transactions));
  private prompts = JSON.parse(JSON.stringify(mockData.prompts));

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